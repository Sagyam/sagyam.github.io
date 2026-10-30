'use client';

import { Pause, Play, Send, Server, User, Zap } from 'lucide-react';
import { type ReactNode, useReducer, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { Range, Segmented, Stat } from '../shared/controls';
import { Demo, useDemoVisible } from '../shared/demo';
import { useFrame } from '../shared/hooks';
import {
  busiestSpan,
  FixedWindow,
  LeakyBucket,
  type Limiter,
  Simulation,
  type SlidingMode,
  SlidingWindow,
  TokenBucket,
  Traffic,
} from './engine';
import { SPAN, Timeline, type TimelineBand } from './timeline';

type Algorithm = 'token-bucket' | 'leaky-bucket' | 'fixed-window' | 'sliding-window';

interface Param {
  label: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  format: (v: number) => string;
}

const perSecond = (v: number) => `${v}/s`;
const seconds = (v: number) => `${v}s`;
const count = (unit: string) => (v: number) => `${v} ${unit}`;

const CONFIG: Record<Algorithm, { title: string; caption: ReactNode; a: Param; b: Param }> = {
  'token-bucket': {
    title: 'Token bucket',
    caption:
      'Each request spends one token; tokens drip back in at the refill rate. A full bucket lets a burst straight through.',
    a: { label: 'Bucket capacity', min: 1, max: 20, step: 1, initial: 10, format: count('tokens') },
    b: { label: 'Refill rate', min: 0.5, max: 10, step: 0.5, initial: 2, format: perSecond },
  },
  'leaky-bucket': {
    title: 'Leaky bucket',
    caption:
      'Requests wait in the bucket and leave at a fixed rate, however they arrive. Compare the evenly spaced “to server” row with the bursty “in” row.',
    a: { label: 'Bucket size', min: 1, max: 20, step: 1, initial: 8, format: count('requests') },
    b: { label: 'Leak rate', min: 0.5, max: 10, step: 0.5, initial: 2, format: perSecond },
  },
  'fixed-window': {
    title: 'Fixed window',
    caption:
      'Each shaded column is one window, labelled with how many requests it let through. A red band marks a stretch one window long that let through more than the limit.',
    a: {
      label: 'Limit per window',
      min: 1,
      max: 20,
      step: 1,
      initial: 5,
      format: count('requests'),
    },
    b: { label: 'Window length', min: 1, max: 5, step: 0.5, initial: 3, format: seconds },
  },
  'sliding-window': {
    title: 'Sliding window',
    caption:
      'The amber band is the window: always the last few seconds, ending now. Log mode counts requests in it exactly; counter mode estimates from two fixed windows.',
    a: {
      label: 'Limit per window',
      min: 1,
      max: 20,
      step: 1,
      initial: 5,
      format: count('requests'),
    },
    b: { label: 'Window length', min: 1, max: 5, step: 0.5, initial: 3, format: seconds },
  },
};

const TRAVEL = 0.6;

function makeLimiter(algorithm: Algorithm, a: number, b: number, mode: SlidingMode): Limiter {
  switch (algorithm) {
    case 'token-bucket':
      return new TokenBucket(a, b);
    case 'leaky-bucket':
      return new LeakyBucket(a, b);
    case 'fixed-window':
      return new FixedWindow(a, b);
    case 'sliding-window':
      return new SlidingWindow(a, b, mode);
  }
}

function RateLimiterDemo({ algorithm }: { algorithm: Algorithm }) {
  const config = CONFIG[algorithm];
  const [a, setA] = useState(config.a.initial);
  const [b, setB] = useState(config.b.initial);
  const [mode, setMode] = useState<SlidingMode>('log');
  const [background, setBackground] = useState(0);
  const [paused, setPaused] = useState(false);
  const create = () => ({
    sim: new Simulation(makeLimiter(algorithm, config.a.initial, config.b.initial, 'log'), TRAVEL),
    traffic: new Traffic(),
  });
  const [world, setWorld] = useState(create);
  const [, render] = useReducer((x: number) => x + 1, 0);
  const visible = useDemoVisible();
  const { sim, traffic } = world;
  const limiter = sim.limiter;
  const now = sim.now;

  useFrame((dt) => {
    const to = sim.now + dt;
    for (const t of traffic.take(to)) sim.send(t);
    sim.advance(to);
    render();
  }, visible && !paused);

  const configure = (nextA: number, nextB: number, nextMode: SlidingMode) => {
    setA(nextA);
    setB(nextB);
    setMode(nextMode);
    if (limiter instanceof TokenBucket) limiter.configure(nextA, nextB, now);
    else if (limiter instanceof SlidingWindow) limiter.configure(nextA, nextB, nextMode);
    else (limiter as LeakyBucket | FixedWindow).configure(nextA, nextB);
  };

  const reset = () => {
    setA(config.a.initial);
    setB(config.b.initial);
    setMode('log');
    setBackground(0);
    setPaused(false);
    setWorld(create());
  };

  const burst = () => traffic.schedule(Array.from({ length: 8 }, (_, i) => now + i * 0.07));

  // Fill the end of one window and the start of the next: twice the limit, a moment apart.
  const boundaryBurst = () => {
    let boundary = (Math.floor((now + TRAVEL) / b) + 1) * b;
    if (boundary - (now + TRAVEL) < 0.6) boundary += b;
    const spread = Math.min(0.4, b / 4);
    const arrivals = Array.from({ length: a }, (_, i) => (spread * (i + 0.5)) / a);
    traffic.schedule([
      ...arrivals.map((d) => boundary - spread + d - TRAVEL),
      ...arrivals.map((d) => boundary + d - TRAVEL),
    ]);
  };

  const decided = sim.packets.filter((p) => p.decision);
  const rows = [
    {
      label: 'In',
      ticks: decided.map((p) => ({
        t: p.arriveAt,
        tone: p.decision === 'drop' ? ('drop' as const) : ('accept' as const),
      })),
    },
    {
      label: 'To server',
      ticks: sim.packets
        .filter((p) => p.departAt !== undefined)
        .map((p) => ({ t: p.departAt as number, tone: 'neutral' as const })),
    },
  ];

  const bands: TimelineBand[] = [];
  if (limiter instanceof FixedWindow || limiter instanceof SlidingWindow) {
    const w = limiter.window;
    const accepted = decided.filter((p) => p.decision === 'accept').map((p) => p.arriveAt);
    const first = Math.floor((now - SPAN) / w);
    const striped = limiter instanceof FixedWindow || limiter.mode === 'counter';
    for (let i = first; striped && i <= Math.floor(now / w); i++) {
      const inside = accepted.filter((t) => t >= i * w && t < (i + 1) * w).length;
      bands.push({
        from: i * w,
        to: (i + 1) * w,
        tone: i % 2 === 0 ? 'stripe' : 'plain',
        label: limiter instanceof FixedWindow ? `${inside}/${limiter.limit}` : undefined,
      });
    }
    if (limiter instanceof FixedWindow) {
      const peak = busiestSpan(accepted, w);
      if (peak.count > limiter.limit) {
        bands.push({
          from: peak.from,
          to: peak.from + w,
          tone: 'over',
          label: `${peak.count} in ${w}s`,
        });
      }
    } else {
      bands.push({
        from: now - w,
        to: now,
        tone: 'focus',
        label: `${formatLoad(limiter.load(now))}/${limiter.limit}`,
      });
    }
  }

  return (
    <Demo title={config.title} onReset={reset} caption={config.caption}>
      <Lane
        sim={sim}
        control={
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Resume' : 'Pause'}
            className="absolute top-2 right-2 z-20 flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-edge/5 hover:text-foreground"
          >
            {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
          </button>
        }
      >
        <Widget limiter={limiter} now={now} />
      </Lane>

      <Timeline now={now} rows={rows} bands={bands} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Range
          label={config.a.label}
          value={a}
          min={config.a.min}
          max={config.a.max}
          step={config.a.step}
          onChange={(v) => configure(v, b, mode)}
          display={config.a.format(a)}
        />
        <Range
          label={config.b.label}
          value={b}
          min={config.b.min}
          max={config.b.max}
          step={config.b.step}
          onChange={(v) => configure(a, v, mode)}
          display={config.b.format(b)}
        />
      </div>

      {algorithm === 'sliding-window' && (
        <Segmented
          label="Sliding window variant"
          value={mode}
          onChange={(m) => configure(a, b, m)}
          options={[
            { value: 'log', label: 'Log: exact count' },
            { value: 'counter', label: 'Counter: weighted estimate' },
          ]}
        />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => sim.send(now)} disabled={paused}>
            <Send /> Send request
          </Button>
          <Button size="sm" variant="outline" onClick={burst} disabled={paused}>
            <Zap /> Burst of 8
          </Button>
          {algorithm === 'fixed-window' && (
            <Button size="sm" variant="outline" onClick={boundaryBurst} disabled={paused}>
              <Zap /> Boundary burst
            </Button>
          )}
        </div>
        <Range
          className="flex-1"
          label="Background traffic"
          value={background}
          min={0}
          max={8}
          step={0.5}
          onChange={(v) => {
            setBackground(v);
            traffic.setRate(v, now);
          }}
          display={background === 0 ? 'off' : `~${background}/s`}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Accepted" value={sim.accepted} tone="good" />
        <Stat label="Dropped" value={sim.dropped} tone={sim.dropped > 0 ? 'bad' : 'default'} />
        {algorithm === 'leaky-bucket' ? (
          <Stat
            label="Average wait"
            value={sim.served === 0 ? '–' : `${(sim.totalWait / sim.served).toFixed(2)}s`}
            hint="time spent queued"
          />
        ) : (
          <Stat
            label="Passed"
            value={
              sim.accepted + sim.dropped === 0
                ? '–'
                : `${Math.round((sim.accepted / (sim.accepted + sim.dropped)) * 100)}%`
            }
          />
        )}
      </div>
    </Demo>
  );
}

const formatLoad = (load: number) => (Number.isInteger(load) ? `${load}` : load.toFixed(1));

/** Client → limiter → server, with requests in flight drawn as dots. */
function Lane({
  sim,
  control,
  children,
}: {
  sim: Simulation;
  control: ReactNode;
  children: ReactNode;
}) {
  const now = sim.now;
  const dots: { id: number; x: number; y: number; opacity: number; tone: string }[] = [];
  for (const p of sim.packets) {
    if (now < p.arriveAt) {
      dots.push({
        id: p.id,
        x: ((now - p.sentAt) / TRAVEL) * 0.5,
        y: 0,
        opacity: 1,
        tone: 'bg-primary',
      });
    } else if (p.decision === 'drop') {
      const age = (now - p.arriveAt) / 0.8;
      if (age < 1)
        dots.push({ id: p.id, x: 0.5, y: age * 40, opacity: 1 - age, tone: 'bg-destructive' });
    } else if (p.departAt !== undefined && now >= p.departAt) {
      const age = (now - p.departAt) / TRAVEL;
      if (age < 1)
        dots.push({ id: p.id, x: 0.5 + age * 0.5, y: 0, opacity: 1, tone: 'bg-success' });
    }
  }

  return (
    <div className="relative h-32 overflow-hidden rounded-lg border border-edge/10 bg-edge/[0.02]">
      {control}
      <div className="absolute top-1/2 right-14 left-14 border-t border-dashed border-edge/15" />
      <Endpoint className="left-2" icon={<User className="size-4" />} label="Client" />
      <Endpoint className="right-2" icon={<Server className="size-4" />} label="Server" />
      {dots.map((d) => (
        <span
          key={d.id}
          className={cn('absolute top-1/2 size-2.5 rounded-full', d.tone)}
          style={{
            left: `calc(3.5rem + ${d.x} * (100% - 7rem))`,
            transform: `translate(-50%, calc(-50% + ${d.y}px))`,
            opacity: d.opacity,
          }}
        />
      ))}
      <div className="absolute top-1/2 left-1/2 z-10 w-40 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-edge/15 bg-card px-3 py-2 shadow-sm sm:w-44">
        {children}
      </div>
    </div>
  );
}

function Endpoint({
  className,
  icon,
  label,
}: {
  className: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <div
      className={cn(
        'absolute top-1/2 flex w-11 -translate-y-1/2 flex-col items-center gap-1 text-[10px] text-muted-foreground',
        className
      )}
    >
      <span className="flex size-8 items-center justify-center rounded-full border border-edge/15 bg-card text-foreground">
        {icon}
      </span>
      {label}
    </div>
  );
}

function Widget({ limiter, now }: { limiter: Limiter; now: number }) {
  if (limiter instanceof TokenBucket) {
    const level = limiter.level(now);
    return (
      <WidgetFrame
        title="Tokens"
        value={`${Math.floor(level)} / ${limiter.capacity}`}
        detail={`+${limiter.rate}/s`}
      >
        <Slots
          total={limiter.capacity}
          fill={(i) => Math.min(Math.max(level - i, 0), 1)}
          className="rounded-full bg-amber"
        />
      </WidgetFrame>
    );
  }
  if (limiter instanceof LeakyBucket) {
    return (
      <WidgetFrame
        title="Queue"
        value={`${limiter.queue.length} / ${limiter.capacity}`}
        detail={`${limiter.rate}/s out`}
      >
        <Slots
          total={Math.max(limiter.capacity, limiter.queue.length)}
          fill={(i) => (i < limiter.queue.length ? 1 : 0)}
          className="rounded-[3px] bg-primary"
        />
      </WidgetFrame>
    );
  }
  if (limiter instanceof FixedWindow) {
    const elapsed = now / limiter.window - Math.floor(now / limiter.window);
    return (
      <WidgetFrame
        title="This window"
        value={`${limiter.countAt(now)} / ${limiter.limit}`}
        detail={`resets in ${((1 - elapsed) * limiter.window).toFixed(1)}s`}
      >
        <div className="h-1.5 overflow-hidden rounded-full bg-edge/10">
          <div className="h-full bg-amber" style={{ width: `${elapsed * 100}%` }} />
        </div>
      </WidgetFrame>
    );
  }
  if (limiter instanceof SlidingWindow) {
    const load = limiter.load(now);
    const { previous, weight, current } = limiter.parts(now);
    return (
      <WidgetFrame
        title={`Last ${limiter.window}s`}
        value={`${formatLoad(load)} / ${limiter.limit}`}
        detail={
          limiter.mode === 'log' ? 'exact count' : `${previous} × ${weight.toFixed(2)} + ${current}`
        }
      >
        <div className="h-1.5 overflow-hidden rounded-full bg-edge/10">
          <div
            className={cn('h-full', load >= limiter.limit ? 'bg-destructive' : 'bg-amber')}
            style={{ width: `${Math.min(load / limiter.limit, 1) * 100}%` }}
          />
        </div>
      </WidgetFrame>
    );
  }
  return null;
}

function WidgetFrame({
  title,
  value,
  detail,
  children,
}: {
  title: string;
  value: string;
  detail: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{title}</span>
        <span className="figures text-sm font-medium text-foreground">{value}</span>
      </div>
      {children}
      <div className="figures text-[10px] text-muted-foreground">{detail}</div>
    </div>
  );
}

function Slots({
  total,
  fill,
  className,
}: {
  total: number;
  fill: (i: number) => number;
  className: string;
}) {
  return (
    <div className="grid grid-cols-10 gap-1">
      {Array.from({ length: total }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: slots are positional
        <span key={i} className="relative aspect-square">
          <span className={cn('absolute inset-0 opacity-15', className)} />
          <span className={cn('absolute inset-0', className)} style={{ opacity: fill(i) }} />
        </span>
      ))}
    </div>
  );
}

export const TokenBucketDemo = () => <RateLimiterDemo algorithm="token-bucket" />;
export const LeakyBucketDemo = () => <RateLimiterDemo algorithm="leaky-bucket" />;
export const FixedWindowDemo = () => <RateLimiterDemo algorithm="fixed-window" />;
export const SlidingWindowDemo = () => <RateLimiterDemo algorithm="sliding-window" />;
