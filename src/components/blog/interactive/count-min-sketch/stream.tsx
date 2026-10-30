'use client';

import { Pause, Play } from 'lucide-react';
import { useReducer, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { Eyebrow, Range, Stat } from '../shared/controls';
import { Demo, useDemoVisible } from '../shared/demo';
import { grouped } from '../shared/format';
import { murmur3 } from '../shared/hash';
import { useFrame } from '../shared/hooks';
import { type Cell, CountMinSketch, type RowHash } from './cms';

const FRUITS = [
  ['apple', '🍎'],
  ['banana', '🍌'],
  ['orange', '🍊'],
  ['grape', '🍇'],
  ['strawberry', '🍓'],
  ['mango', '🥭'],
  ['watermelon', '🍉'],
  ['pineapple', '🍍'],
  ['peach', '🍑'],
  ['cherry', '🍒'],
  ['lemon', '🍋'],
  ['kiwi', '🥝'],
  ['pear', '🍐'],
  ['melon', '🍈'],
  ['coconut', '🥥'],
  ['blueberry', '🫐'],
] as const;
const TOTAL = 5000;

// Zipf (s = 1.1): a few fruits dominate and a long tail is rare, like real traffic.
const weights = FRUITS.map((_, rank) => 1 / (rank + 1) ** 1.1);
const cumulative = weights.map(
  (_, i) => weights.slice(0, i + 1).reduce((a, b) => a + b, 0) / weights.reduce((a, b) => a + b, 0)
);
const sample = () => {
  const r = Math.random();
  return cumulative.findIndex((c) => r <= c);
};

const fruitHash: RowHash<number> = (row, fruit, width) =>
  murmur3(FRUITS[fruit][0], 0x9e3779b1 * (row + 1)) % width;

interface Run {
  sketch: CountMinSketch<number>;
  counts: number[];
  processed: number;
  recent: { fruit: number; id: number }[];
  lastCells: Cell[];
}

const freshRun = (depth: number, width: number): Run => ({
  sketch: new CountMinSketch(depth, width, fruitHash),
  counts: FRUITS.map(() => 0),
  processed: 0,
  recent: [],
  lastCells: [],
});

export function CmsStream() {
  const [depth, setDepth] = useState(3);
  const [width, setWidth] = useState(10);
  const [speed, setSpeed] = useState(2); // log10 of items per second
  const [playing, setPlaying] = useState(false);
  const run = useRef(freshRun(3, 10));
  const owed = useRef(0);
  const [, render] = useReducer((x: number) => x + 1, 0);
  const visible = useDemoVisible();

  const perSecond = Math.round(10 ** speed);
  const { sketch, counts, processed } = run.current;
  const done = processed >= TOTAL;

  useFrame(
    (dt) => {
      const r = run.current;
      owed.current += perSecond * dt;
      const n = Math.min(Math.floor(owed.current), TOTAL - r.processed);
      owed.current -= n;
      for (let i = 0; i < n; i++) {
        const fruit = sample();
        r.lastCells = r.sketch.add(fruit);
        r.counts[fruit]++;
        r.processed++;
        r.recent.push({ fruit, id: r.processed });
      }
      if (r.recent.length > 16) r.recent = r.recent.slice(-16);
      if (r.processed >= TOTAL) setPlaying(false);
      if (n > 0) render();
    },
    playing && visible && !done
  );

  const restart = (nextDepth = depth, nextWidth = width) => {
    run.current = freshRun(nextDepth, nextWidth);
    owed.current = 0;
    setDepth(nextDepth);
    setWidth(nextWidth);
    setPlaying(false);
  };

  const rows = FRUITS.map(([name, emoji], i) => ({
    name,
    emoji,
    actual: counts[i],
    estimate: processed === 0 ? 0 : sketch.query(i).estimate,
  })).sort((a, b) => b.actual - a.actual);
  const scale = Math.max(1, ...rows.map((r) => r.estimate));
  const maxError = Math.max(0, ...rows.map((r) => r.estimate - r.actual));
  const bound = (Math.E / width) * processed;
  const showNumbers = width <= 16;
  const lastSet = new Set(run.current.lastCells.map((c) => `${c.row}:${c.col}`));
  const cellMax = Math.max(1, ...sketch.table.flatMap((row) => Array.from(row)));

  return (
    <Demo
      title="Streaming fruit"
      onReset={() => restart(3, 10)}
      caption="Changing the sketch's shape starts the stream over. The bars are sorted by how often each fruit really appeared."
    >
      <div className="grid gap-5 sm:grid-cols-3">
        <Range
          label="Columns (w)"
          value={width}
          min={4}
          max={40}
          onChange={(w) => restart(depth, w)}
        />
        <Range label="Rows (d)" value={depth} min={1} max={5} onChange={(d) => restart(d, width)} />
        <Range
          label="Speed"
          value={speed}
          min={0.7}
          max={3.3}
          step={0.05}
          onChange={setSpeed}
          display={`${grouped(perSecond)}/s`}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          size="sm"
          onClick={() => (done ? restart() : setPlaying((p) => !p))}
          className="w-28 shrink-0"
        >
          {playing ? <Pause /> : <Play />}
          {done ? 'Again' : playing ? 'Pause' : processed > 0 ? 'Resume' : 'Start'}
        </Button>
        <div className="flex h-9 min-w-0 flex-1 items-center gap-1 overflow-hidden rounded-lg border border-edge/10 bg-edge/[0.02] px-2">
          {run.current.recent.length === 0 && (
            <span className="text-xs text-muted-foreground">The stream will flow here…</span>
          )}
          {run.current.recent
            .slice()
            .reverse()
            .map(({ fruit, id }, i) => (
              <span
                key={id}
                className="animate-in slide-in-from-left-4 text-lg duration-200"
                style={{ opacity: 1 - i / 18 }}
              >
                {FRUITS[fruit][1]}
              </span>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Processed" value={`${grouped(processed)} / ${grouped(TOTAL)}`} />
        <Stat label="Worst overestimate" value={`+${grouped(maxError)}`} />
        <Stat label="Error bound" value={`≤ ${grouped(bound)}`} hint="εN, where ε = e / w" />
        <Stat label="Underestimates" value="0" tone="good" hint="never, by design" />
      </div>

      <div className="space-y-2">
        <Eyebrow>
          The sketch · {depth} × {width} = {depth * width} counters
        </Eyebrow>
        <div className="space-y-1">
          {sketch.table.map((row, r) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional
              key={r}
              className="grid gap-0.5"
              style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}
            >
              {Array.from(row, (value, c) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: columns are positional
                  key={c}
                  className={cn(
                    'relative flex h-8 items-center justify-center overflow-hidden rounded-sm font-mono text-[10px] text-foreground',
                    lastSet.has(`${r}:${c}`) && playing && 'ring-2 ring-amber'
                  )}
                >
                  <span
                    className="absolute inset-0 bg-primary"
                    style={{ opacity: value === 0 ? 0.05 : 0.12 + 0.6 * (value / cellMax) }}
                  />
                  {showNumbers && <span className="relative">{value}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Eyebrow>Actual vs. estimated count</Eyebrow>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-4 rounded-sm bg-primary" /> actual
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-4 rounded-sm bg-amber" /> overestimate
            </span>
          </div>
        </div>
        <div className="space-y-1">
          {rows.map((r) => {
            const over = r.estimate - r.actual;
            return (
              <div
                key={r.name}
                className="grid grid-cols-[1.5rem_1fr_6.5rem] items-center gap-2 text-xs"
              >
                <span className="text-base leading-none" title={r.name}>
                  {r.emoji}
                </span>
                <div className="flex h-3 overflow-hidden rounded-sm bg-edge/[0.04]">
                  <div
                    className="h-full bg-primary transition-[width] duration-150"
                    style={{ width: `${(r.actual / scale) * 100}%` }}
                  />
                  <div
                    className="h-full border-l-2 border-card bg-amber transition-[width] duration-150"
                    style={{
                      width: `${(over / scale) * 100}%`,
                      display: over > 0 ? undefined : 'none',
                    }}
                  />
                </div>
                <span className="figures text-right text-muted-foreground">
                  {grouped(r.actual)}
                  {over > 0 && <span className="text-amber"> +{grouped(over)}</span>}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Demo>
  );
}
