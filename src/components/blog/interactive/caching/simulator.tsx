'use client';

import { AppWindow, BookOpen, Database, FilePlus, Layers, PenLine, Skull } from 'lucide-react';
import { type ReactNode, useEffect, useReducer, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { Eyebrow, Stat } from '../shared/controls';
import { Demo, useDemoVisible } from '../shared/demo';
import { useFrame, useReducedMotion } from '../shared/hooks';
import {
  CacheModel,
  CAPACITY,
  FLUSH_DELAY,
  HOP_MS,
  KEYS,
  type NodeName,
  REFRESH_AFTER,
  STRATEGIES,
  type Strategy,
  TTL,
} from './model';

// Diagram geometry: node centres as (x %, y px). The low lane carries app ↔ database traffic.
const NODE_X: Record<NodeName, number> = { app: 12, cache: 50, db: 88 };
const TOP = 38;
const LOW = 104;

type Tone = 'request' | 'hit' | 'miss' | 'data' | 'write';

interface Packet {
  id: number;
  path: [number, number][];
  label: string;
  tone: Tone;
  duration: number;
}

const packetTone: Record<Tone, string> = {
  request: 'border-primary/40 bg-card text-primary',
  hit: 'border-success/40 bg-success text-card',
  miss: 'border-destructive/40 bg-destructive text-card',
  data: 'border-edge/15 bg-card text-foreground',
  write: 'border-amber/50 bg-amber text-card',
};

class Aborted extends Error {}

export function CacheSimulator({ strategy }: { strategy: Strategy }) {
  const config = STRATEGIES[strategy];
  const model = useRef(new CacheModel());
  const generation = useRef(0);
  const resolvers = useRef(new Map<number, () => void>());
  const packetId = useRef(0);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState('user2');
  const [, render] = useReducer((x: number) => x + 1, 0);
  const visible = useDemoVisible();
  const reduced = useReducedMotion();
  const m = model.current;

  // Settle any in-flight hops when the demo unmounts.
  useEffect(() => {
    const pending = resolvers.current;
    return () => {
      for (const resolve of pending.values()) resolve();
    };
  }, []);

  /** Animate one message between two nodes. Untimed hops are background work. */
  const hop = (from: NodeName, to: NodeName, label: string, tone: Tone, timed = true) => {
    const gen = generation.current;
    const viaLow = (from === 'app' && to === 'db') || (from === 'db' && to === 'app');
    const path: [number, number][] = viaLow
      ? [
          [NODE_X[from], TOP],
          [NODE_X[from], LOW],
          [NODE_X[to], LOW],
          [NODE_X[to], TOP],
        ]
      : [
          [NODE_X[from], TOP],
          [NODE_X[to], TOP],
        ];
    const isDb = from === 'db' || to === 'db';
    const duration = (isDb ? 900 : 450) * (reduced ? 0.3 : 1);
    const id = packetId.current++;
    if (timed && m.last) {
      m.last.ms += isDb ? HOP_MS.db : HOP_MS.cache;
      if (isDb) m.last.dbHops++;
      else m.last.cacheHops++;
    }
    return new Promise<void>((resolve, reject) => {
      resolvers.current.set(id, () => {
        resolvers.current.delete(id);
        setPackets((ps) => ps.filter((p) => p.id !== id));
        if (gen !== generation.current) reject(new Aborted());
        else resolve();
      });
      setPackets((ps) => [...ps, { id, path, label, tone, duration }]);
    });
  };

  /** Run a user operation: one at a time, with its latency tallied. */
  const operate = async (label: string, script: () => Promise<void>) => {
    setBusy(true);
    m.last = { label, ms: 0, cacheHops: 0, dbHops: 0 };
    try {
      await script();
    } catch (error) {
      if (!(error instanceof Aborted)) throw error;
    } finally {
      setBusy(false);
      render();
    }
  };

  /** Background work (flushes, refreshes) runs alongside user operations and isn't timed. */
  const background = async (script: () => Promise<void>) => {
    try {
      await script();
    } catch (error) {
      if (!(error instanceof Aborted)) throw error;
    }
    render();
  };

  const fill = (k: string, value: string) => {
    const evicted = m.put(k, value);
    if (evicted) m.say('Cache', `full, evicted ${evicted.key} to make room`, 'bad');
  };

  const read = (k: string) =>
    operate(`Read ${k}`, async () => {
      await hop('app', 'cache', `GET ${k}`, 'request');
      const entry = m.get(k);
      if (entry) {
        m.stats.hits++;
        m.touch(entry);
        m.say('Cache', `hit: ${k} = ${entry.value}`, 'hit');
        render();
        await hop('cache', 'app', entry.value, 'hit');
        return;
      }
      m.stats.misses++;
      m.say('Cache', `miss for ${k}`, 'miss');
      render();
      if (config.reads === 'aside') {
        await hop('cache', 'app', 'miss', 'miss');
        m.say('App', `queries the database for ${k}`);
        render();
        await hop('app', 'db', `SELECT ${k}`, 'request');
        m.stats.dbReads++;
        const value = m.db[k];
        await hop('db', 'app', value, 'data');
        await hop('app', 'cache', `SET ${k}`, 'data');
        fill(k, value);
        m.say('App', `stored ${k} in the cache`);
      } else {
        m.say('Cache', `loads ${k} from the database itself`);
        render();
        await hop('cache', 'db', `SELECT ${k}`, 'request');
        m.stats.dbReads++;
        const value = m.db[k];
        await hop('db', 'cache', value, 'data');
        fill(k, value);
        render();
        await hop('cache', 'app', value, 'data');
      }
    });

  const write = (k: string, value = m.nextValue(k)) =>
    operate(`Write ${k}`, async () => {
      switch (config.writes) {
        case 'invalidate':
        case 'around': {
          m.say('App', `writes ${k} = ${value} straight to the database`);
          render();
          await hop('app', 'db', `UPDATE ${k}`, 'write');
          m.db[k] = value;
          m.stats.dbWrites++;
          render();
          await hop('db', 'app', 'ok', 'data');
          if (m.get(k)) {
            await hop('app', 'cache', `DEL ${k}`, 'write');
            m.remove(k);
            m.say('App', `invalidated the cached ${k} so it can't go stale`);
          } else if (config.writes === 'around') {
            m.say('App', `left the cache alone: ${k} wasn't in it`);
          }
          break;
        }
        case 'through': {
          await hop('app', 'cache', `SET ${k}`, 'write');
          fill(k, value);
          m.say('Cache', `stored ${k} = ${value}, now writing it to the database`);
          render();
          await hop('cache', 'db', `UPDATE ${k}`, 'write');
          m.db[k] = value;
          m.stats.dbWrites++;
          render();
          await hop('db', 'cache', 'ok', 'data');
          await hop('cache', 'app', 'ok', 'data');
          m.say('Cache', 'acknowledged once both copies agree');
          break;
        }
        case 'back': {
          await hop('app', 'cache', `SET ${k}`, 'write');
          const evicted = m.put(k, value, true);
          if (evicted) m.say('Cache', `full, evicted ${evicted.key}`, 'bad');
          if (m.flushAt === null) m.flushAt = m.now + FLUSH_DELAY;
          m.say('Cache', `stored ${k} = ${value}; the database is now behind`);
          render();
          await hop('cache', 'app', 'ok', 'data');
          break;
        }
      }
    });

  const newRecord = () => {
    m.records++;
    const k = `log:${m.records}`;
    write(k, `entry ${m.records}`);
  };

  const crash = () => {
    const lost = m.cache.filter((e) => e.dirty);
    m.cache = [];
    m.flushAt = null;
    m.stats.lost += lost.length;
    m.say(
      'Cache',
      lost.length > 0
        ? `crashed! ${lost.length} unsaved ${lost.length === 1 ? 'write' : 'writes'} lost for good`
        : 'crashed and restarted empty. Nothing unsaved, nothing lost',
      lost.length > 0 ? 'bad' : 'plain'
    );
    render();
  };

  const flush = () =>
    background(async () => {
      const dirty = m.cache.filter((e) => e.dirty);
      m.flushAt = null;
      if (dirty.length === 0) return;
      m.flushing = true;
      m.say(
        'Cache',
        `flushing ${dirty.length} unsaved ${dirty.length === 1 ? 'entry' : 'entries'}`
      );
      render();
      await hop('cache', 'db', `UPDATE ×${dirty.length}`, 'write', false);
      for (const e of dirty) {
        // A crash mid-flight empties the cache; only entries still held are saved.
        if (!m.cache.includes(e)) continue;
        m.db[e.key] = e.value;
        e.dirty = false;
      }
      m.stats.dbWrites++;
      m.flushing = false;
      render();
      await hop('db', 'cache', 'ok', 'data', false);
    });

  const refresh = (k: string) =>
    background(async () => {
      const entry = m.get(k);
      if (!entry) return;
      entry.refreshing = true;
      await hop('cache', 'db', `SELECT ${k}`, 'request', false);
      m.stats.dbReads++;
      await hop('db', 'cache', m.db[k], 'data', false);
      const still = m.get(k);
      if (still) {
        still.value = m.db[k];
        still.storedAt = m.now;
        still.refreshing = false;
        m.say('Cache', `refreshed ${k} before it expired`);
      }
    });

  useFrame(
    (dt) => {
      m.now += dt;
      if (config.writes === 'back' && m.flushAt !== null && m.now >= m.flushAt && !m.flushing) {
        flush();
      }
      if (config.refresh) {
        for (const e of [...m.cache]) {
          const age = m.now - e.storedAt;
          if (age >= TTL && !e.refreshing) {
            m.remove(e.key);
            m.say('Cache', `${e.key} expired`, 'miss');
          } else if (age >= REFRESH_AFTER && !e.refreshing && m.now - e.lastRead < TTL) {
            refresh(e.key);
          }
        }
      }
      if (config.refresh || m.flushAt !== null) render();
    },
    visible && (config.refresh === true || config.writes === 'back')
  );

  const reset = () => {
    generation.current++;
    for (const resolve of [...resolvers.current.values()]) resolve();
    model.current = new CacheModel();
    setPackets([]);
    setBusy(false);
    setKey('user2');
  };

  const total = m.stats.hits + m.stats.misses;

  return (
    <Demo title={config.title} onReset={reset} caption={config.caption}>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          <span className="text-foreground">Reads:</span> {config.readsLabel}
        </span>
        <span>
          <span className="text-foreground">Writes:</span> {config.writesLabel}
        </span>
      </div>

      <Diagram
        aside={config.reads === 'aside'}
        packets={packets}
        onArrive={(id) => resolvers.current.get(id)?.()}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <fieldset className="flex flex-wrap items-center gap-1.5" aria-label="Key">
          <span className="mr-1 text-xs text-muted-foreground">Key</span>
          {KEYS.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={k === key}
              onClick={() => setKey(k)}
              className={cn(
                'rounded-full border px-2.5 py-1 font-mono text-xs transition-colors',
                k === key
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-edge/10 text-muted-foreground hover:text-foreground'
              )}
            >
              {k}
            </button>
          ))}
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => read(key)} disabled={busy}>
            <BookOpen /> Read
          </Button>
          <Button size="sm" variant="outline" onClick={() => write(key)} disabled={busy}>
            <PenLine /> Write
          </Button>
          {config.newRecord && (
            <Button size="sm" variant="outline" onClick={newRecord} disabled={busy}>
              <FilePlus /> New record
            </Button>
          )}
          {config.crash && (
            <Button size="sm" variant="outline" onClick={crash}>
              <Skull /> Crash cache
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Store
          title={`Cache · ${m.cache.length}/${CAPACITY}`}
          rows={[...m.cache].reverse().map((e) => ({
            key: e.key,
            value: e.value,
            badge: e.dirty ? (
              <Badge tone="warn">unsaved</Badge>
            ) : e.refreshing ? (
              <Badge tone="info">refreshing</Badge>
            ) : null,
            ttl: config.refresh ? Math.max(1 - (m.now - e.storedAt) / TTL, 0) : undefined,
          }))}
          empty="empty"
        />
        <Store
          title="Database"
          rows={Object.entries(m.db).map(([k, value]) => {
            const cached = m.get(k);
            return {
              key: k,
              value,
              badge:
                cached?.dirty && cached.value !== value ? <Badge tone="warn">behind</Badge> : null,
            };
          })}
          empty=""
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="Last request"
          value={m.last ? `${m.last.ms} ms` : '–'}
          hint={m.last ? `${m.last.label} · ${m.last.dbHops} DB hops` : 'simulated latency'}
        />
        <Stat
          label="Hit rate"
          value={total === 0 ? '–' : `${Math.round((m.stats.hits / total) * 100)}%`}
          hint={`${m.stats.hits} hits · ${m.stats.misses} misses`}
        />
        <Stat label="DB reads" value={m.stats.dbReads} />
        {config.crash ? (
          <Stat
            label="Writes lost"
            value={m.stats.lost}
            tone={m.stats.lost > 0 ? 'bad' : 'default'}
            hint={
              m.flushAt !== null
                ? `flush in ${Math.max(m.flushAt - m.now, 0).toFixed(1)}s`
                : 'nothing pending'
            }
          />
        ) : (
          <Stat label="DB writes" value={m.stats.dbWrites} />
        )}
      </div>

      <div className="space-y-2">
        <Eyebrow>What happened</Eyebrow>
        <ol className="min-h-[7.5rem] space-y-1 text-sm" aria-live="polite">
          {m.log.length === 0 && (
            <li className="text-muted-foreground">Pick a key, then read or write it.</li>
          )}
          {m.log.map((line, i) => (
            <li
              key={line.id}
              className={cn('flex items-baseline gap-2 transition-opacity', i > 0 && 'opacity-60')}
            >
              <span className="w-12 shrink-0 font-mono text-[11px] text-muted-foreground">
                {line.actor}
              </span>
              <span
                className={cn(
                  line.tone === 'hit' && 'text-success',
                  line.tone === 'miss' && 'text-amber',
                  line.tone === 'bad' && 'text-destructive',
                  line.tone === 'plain' && 'text-foreground'
                )}
              >
                {line.text}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Demo>
  );
}

function Diagram({
  aside,
  packets,
  onArrive,
}: {
  aside: boolean;
  packets: Packet[];
  onArrive: (id: number) => void;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-lg border border-edge/10 bg-edge/[0.02]"
      style={{ height: aside ? LOW + 32 : TOP + 46 }}
    >
      <svg className="absolute inset-0 size-full" aria-hidden="true">
        <line x1="12%" x2="50%" y1={TOP} y2={TOP} className="stroke-edge/20" strokeWidth={1.5} />
        {aside ? (
          <>
            <line
              x1="12%"
              x2="12%"
              y1={TOP}
              y2={LOW}
              className="stroke-edge/20"
              strokeWidth={1.5}
            />
            <line
              x1="12%"
              x2="88%"
              y1={LOW}
              y2={LOW}
              className="stroke-edge/20"
              strokeWidth={1.5}
            />
            <line
              x1="88%"
              x2="88%"
              y1={TOP}
              y2={LOW}
              className="stroke-edge/20"
              strokeWidth={1.5}
            />
          </>
        ) : (
          <line x1="50%" x2="88%" y1={TOP} y2={TOP} className="stroke-edge/20" strokeWidth={1.5} />
        )}
      </svg>
      <DiagramNode x={NODE_X.app} icon={<AppWindow className="size-4" />} label="App" />
      <DiagramNode x={NODE_X.cache} icon={<Layers className="size-4" />} label="Cache" />
      <DiagramNode x={NODE_X.db} icon={<Database className="size-4" />} label="Database" />
      {packets.map((p) => (
        <PacketPill key={p.id} packet={p} onArrive={onArrive} />
      ))}
    </div>
  );
}

function DiagramNode({ x, icon, label }: { x: number; icon: ReactNode; label: string }) {
  return (
    <div
      className="absolute flex -translate-x-1/2 flex-col items-center gap-1"
      style={{ left: `${x}%`, top: TOP - 18 }}
    >
      <span className="flex size-9 items-center justify-center rounded-lg border border-edge/15 bg-card text-foreground shadow-sm">
        {icon}
      </span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

function PacketPill({ packet, onArrive }: { packet: Packet; onArrive: (id: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const arrive = useRef(onArrive);
  arrive.current = onArrive;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const animation = el.animate(
      packet.path.map(([x, y]) => ({ left: `${x}%`, top: `${y}px` })),
      { duration: packet.duration, easing: 'ease-in-out', fill: 'forwards' }
    );
    // Cancelled animations reject; the hop is settled elsewhere (reset or unmount).
    animation.finished.then(() => arrive.current(packet.id)).catch(() => undefined);
    return () => animation.cancel();
  }, [packet]);

  const [x, y] = packet.path[0];
  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-10 max-w-28 -translate-x-1/2 -translate-y-1/2 truncate rounded-full border px-2 py-0.5 font-mono text-[10px] whitespace-nowrap shadow-sm',
        packetTone[packet.tone]
      )}
      style={{ left: `${x}%`, top: y }}
    >
      {packet.label}
    </div>
  );
}

function Store({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: { key: string; value: string; badge: ReactNode; ttl?: number }[];
  empty: string;
}) {
  return (
    <div className="space-y-2">
      <Eyebrow>{title}</Eyebrow>
      <div className="divide-y divide-edge/5 rounded-lg border border-edge/10">
        {rows.length === 0 && (
          <div className="px-3 py-2 text-xs text-muted-foreground">{empty}</div>
        )}
        {rows.map((row) => (
          <div key={row.key} className="relative px-3 py-1.5">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="w-16 shrink-0 text-muted-foreground">{row.key}</span>
              <span className="min-w-0 flex-1 truncate text-foreground">{row.value}</span>
              {row.badge}
            </div>
            {row.ttl !== undefined && (
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-edge/10">
                <div
                  className={cn(
                    'h-full',
                    row.ttl < 1 - REFRESH_AFTER / TTL ? 'bg-amber' : 'bg-primary/60'
                  )}
                  style={{ width: `${row.ttl * 100}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Badge({ tone, children }: { tone: 'warn' | 'info'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'rounded px-1.5 py-0.5 font-sans text-[10px]',
        tone === 'warn' ? 'bg-amber/15 text-amber' : 'bg-primary/10 text-primary'
      )}
    >
      {children}
    </span>
  );
}

export const CacheAsideDemo = () => <CacheSimulator strategy="cache-aside" />;
export const ReadThroughDemo = () => <CacheSimulator strategy="read-through" />;
export const WriteThroughDemo = () => <CacheSimulator strategy="write-through" />;
export const WriteBackDemo = () => <CacheSimulator strategy="write-back" />;
export const WriteAroundDemo = () => <CacheSimulator strategy="write-around" />;
export const RefreshAheadDemo = () => <CacheSimulator strategy="refresh-ahead" />;
