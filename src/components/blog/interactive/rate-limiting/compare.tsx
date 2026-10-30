'use client';

import { useReducer, useState } from 'react';

import { cn } from '@/lib/utils';

import { Segmented } from '../shared/controls';
import { Demo, useDemoVisible } from '../shared/demo';
import { useFrame } from '../shared/hooks';
import {
  busiestSpan,
  FixedWindow,
  LeakyBucket,
  Simulation,
  SlidingWindow,
  TokenBucket,
  Traffic,
} from './engine';
import { Timeline, type TimelineRow } from './timeline';

// Every limiter gets the same budget: 6 requests per 2 seconds, i.e. 3 per second.
const LIMIT = 6;
const WINDOW = 2;
const PERIOD = 4;

const LIMITERS = [
  { name: 'Token bucket', short: 'Token', make: () => new TokenBucket(LIMIT, LIMIT / WINDOW) },
  { name: 'Leaky bucket', short: 'Leaky', make: () => new LeakyBucket(LIMIT, LIMIT / WINDOW) },
  { name: 'Fixed window', short: 'Fixed', make: () => new FixedWindow(LIMIT, WINDOW) },
  { name: 'Sliding window', short: 'Sliding', make: () => new SlidingWindow(LIMIT, WINDOW, 'log') },
];

type Pattern = 'steady' | 'overload' | 'bursts' | 'boundary';

const PATTERNS: { value: Pattern; label: string }[] = [
  { value: 'steady', label: 'Steady, 2/s' },
  { value: 'overload', label: 'Overload, 6/s' },
  { value: 'bursts', label: 'Bursts of 12' },
  { value: 'boundary', label: 'Window boundaries' },
];

/** Sends for one period of a repeating pattern, starting at `start`. */
function periodSends(pattern: Pattern, start: number): number[] {
  if (pattern === 'bursts') return Array.from({ length: 12 }, (_, i) => start + 1 + i * 0.04);
  if (pattern === 'boundary') {
    // Six just before a fixed-window boundary, six just after. Periods start on a boundary.
    const boundary = start + WINDOW;
    return Array.from({ length: 12 }, (_, i) => boundary - 0.3 + i * 0.05);
  }
  return [];
}

function createWorld(pattern: Pattern) {
  const traffic = new Traffic();
  if (pattern === 'steady') traffic.setRate(2, 0);
  if (pattern === 'overload') traffic.setRate(6, 0);
  return {
    sims: LIMITERS.map((l) => new Simulation(l.make(), 0)),
    traffic,
    nextPeriod: 0,
  };
}

export function RateLimiterComparison() {
  const [pattern, setPattern] = useState<Pattern>('bursts');
  const [world, setWorld] = useState(() => createWorld('bursts'));
  const [, render] = useReducer((x: number) => x + 1, 0);
  const visible = useDemoVisible();
  const now = world.sims[0].now;

  useFrame((dt) => {
    const to = now + dt;
    while (world.nextPeriod <= to + 0.5) {
      world.traffic.schedule(periodSends(pattern, world.nextPeriod));
      world.nextPeriod += PERIOD;
    }
    const sends = world.traffic.take(to);
    for (const sim of world.sims) {
      for (const t of sends) sim.send(t);
      sim.advance(to);
    }
    render();
  }, visible);

  const choose = (next: Pattern) => {
    setPattern(next);
    setWorld(createWorld(next));
  };

  const rows: TimelineRow[] = [
    {
      label: 'In',
      ticks: world.sims[0].packets
        .filter((p) => p.decision)
        .map((p) => ({ t: p.arriveAt, tone: 'neutral' as const })),
    },
    ...world.sims.map((sim, i) => ({
      label: LIMITERS[i].short,
      ticks: sim.packets.flatMap((p): TimelineRow['ticks'] => {
        if (p.decision === 'drop') return [{ t: p.arriveAt, tone: 'drop' }];
        if (p.departAt !== undefined) return [{ t: p.departAt, tone: 'accept' }];
        return [];
      }),
    })),
  ];

  return (
    <Demo
      title="Four limiters, same traffic"
      onReset={() => choose(pattern)}
      caption={`Each limiter allows ${LIMIT} requests per ${WINDOW} seconds. Green ticks reached the server, when they reached it; red ticks were rejected.`}
    >
      <Segmented label="Traffic pattern" value={pattern} onChange={choose} options={PATTERNS} />

      <Timeline now={now} rows={rows} compact />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] text-sm">
          <thead>
            <tr className="border-b border-edge/10 text-left text-[11px] uppercase tracking-widest text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Limiter</th>
              <th className="py-2 pr-3 text-right font-medium">Let through</th>
              <th className="py-2 pr-3 text-right font-medium">Busiest {WINDOW}s</th>
              <th className="py-2 text-right font-medium">Avg wait</th>
            </tr>
          </thead>
          <tbody className="figures">
            {world.sims.map((sim, i) => {
              const total = sim.accepted + sim.dropped;
              const departures = sim.packets
                .map((p) => p.departAt)
                .filter((t): t is number => t !== undefined)
                .sort((a, b) => a - b);
              const peak = busiestSpan(departures, WINDOW).count;
              return (
                <tr key={LIMITERS[i].name} className="border-b border-edge/5">
                  <td className="py-2 pr-3 font-sans text-foreground">{LIMITERS[i].name}</td>
                  <td className="py-2 pr-3 text-right text-muted-foreground">
                    {total === 0 ? '–' : `${Math.round((sim.accepted / total) * 100)}%`}
                  </td>
                  <td
                    className={cn(
                      'py-2 pr-3 text-right',
                      peak > LIMIT ? 'text-amber' : 'text-muted-foreground'
                    )}
                  >
                    {peak}
                    {peak > LIMIT && ' ▲'}
                  </td>
                  <td className="py-2 text-right text-muted-foreground">
                    {sim.served === 0 ? '–' : `${(sim.totalWait / sim.served).toFixed(2)}s`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Demo>
  );
}
