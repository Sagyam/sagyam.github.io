'use client';

import { Dices, Plus } from 'lucide-react';
import { type FormEvent, useReducer, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Eyebrow, Range, Stat } from '../shared/controls';
import { Demo } from '../shared/demo';
import { bitsToSize, compact, grouped, percent } from '../shared/format';
import { randomIPv4 } from '../shared/hash';
import { LineChart, type Point } from '../shared/line-chart';
import { HashBits } from './hash-bits';
import { type AddResult, HyperLogLog } from './hll';
import { RegisterMap } from './register-map';

const BATCHES = [1_000, 5_000, 10_000, 50_000, 100_000];
// The exact Set beside the sketch is what costs memory, not the sketch.
const LIMIT = 1_000_000;

export function HllPlayground() {
  const [p, setP] = useState(7);
  const hll = useRef(new HyperLogLog(7));
  const seen = useRef(new Set<string>());
  const [version, bump] = useReducer((x: number) => x + 1, 0);
  const [last, setLast] = useState<{ value: string; result: AddResult; fresh: boolean } | null>(
    null
  );
  const [history, setHistory] = useState<Point[]>([]);
  const [input, setInput] = useState('');

  const sketch = hll.current;
  const actual = seen.current.size;
  const estimate = actual === 0 ? 0 : sketch.estimate();
  const sigma = sketch.standardError;
  const error = actual === 0 ? 0 : (estimate - actual) / actual;

  const restart = (nextP: number) => {
    hll.current = new HyperLogLog(nextP);
    seen.current = new Set();
    setP(nextP);
    setHistory([]);
    setLast(null);
    bump();
  };

  const add = (values: string[]) => {
    const set = seen.current;
    const points: Point[] = [];
    const sample = () => ({ x: set.size, y: (sketch.estimate() - set.size) / set.size });
    let nextSample = Math.max(set.size * 1.15, set.size + 1);
    let lastResult: AddResult | null = null;
    let fresh = false;
    for (const value of values) {
      fresh = !set.has(value);
      lastResult = sketch.add(value);
      set.add(value);
      // Sample along the way, spaced evenly on a log axis, so one big batch still draws a curve.
      if (set.size >= nextSample) {
        points.push(sample());
        nextSample = set.size * 1.15;
      }
    }
    if (set.size > 0 && points.at(-1)?.x !== set.size) points.push(sample());
    if (lastResult) setLast({ value: values.at(-1) ?? '', result: lastResult, fresh });
    setHistory((prev) => [...prev, ...points.filter((pt) => pt.x !== prev.at(-1)?.x)]);
    bump();
  };

  const onAdd = (event: FormEvent) => {
    event.preventDefault();
    const value = input.trim() || randomIPv4();
    add([value]);
    setInput('');
  };

  const xMax = Math.max(100, 10 ** Math.ceil(Math.log10(Math.max(actual, 1) * 1.01)));
  const xTicks = Array.from({ length: Math.log10(xMax) + 1 }, (_, i) => 10 ** i);
  const yMax = Math.min(3 * sigma, 1);

  return (
    <Demo
      title="HyperLogLog"
      onReset={() => restart(7)}
      caption="The actual count comes from an exact Set kept alongside the sketch, so you can see how far off the estimate is."
    >
      <div className="grid gap-5 md:grid-cols-[1fr_16rem] md:items-end">
        <form onSubmit={onAdd} className="flex flex-wrap gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="An IPv4 address"
            className="h-9 min-w-36 flex-1 font-mono text-sm"
            aria-label="IP address to add"
          />
          <Button type="button" size="sm" variant="outline" onClick={() => setInput(randomIPv4())}>
            <Dices /> Random IP
          </Button>
          <Button type="submit" size="sm">
            <Plus /> Add to HLL
          </Button>
        </form>
        <Range
          label="Buckets (m = 2^p)"
          value={p}
          min={4}
          max={12}
          onChange={restart}
          display={`${grouped(2 ** p)} · ${bitsToSize(2 ** p * 5)}`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs text-muted-foreground">Add random IPs:</span>
        {BATCHES.map((count) => (
          <Button
            key={count}
            size="sm"
            variant="outline"
            disabled={actual + count > LIMIT}
            onClick={() => add(Array.from({ length: count }, randomIPv4))}
          >
            +{compact(count)}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Stat label="Actual count" value={grouped(actual)} />
        <Stat label="HLL estimate" value={grouped(estimate)} />
        <Stat
          label="Actual error"
          value={`${error >= 0 ? '+' : ''}${percent(error, 2)}`}
          tone={Math.abs(error) > 2 * sigma ? 'warn' : 'default'}
        />
        <Stat label="Margin of error" value={`±${percent(sigma)}`} hint="1.04 / √m" />
      </div>

      <div className="space-y-2.5">
        <Eyebrow>Last added</Eyebrow>
        {last ? (
          <>
            <HashBits {...last.result} p={p} />
            <p className="text-sm text-muted-foreground">
              <span className="font-mono text-foreground">{last.value}</span>{' '}
              {!last.fresh && 'was already in the sketch. '}
              {last.result.updated ? (
                <>
                  Bucket <span className="figures text-foreground">{last.result.index}</span> goes
                  from {last.result.previous} to{' '}
                  <span className="figures text-success">{last.result.rho}</span>.
                </>
              ) : (
                <>
                  Bucket <span className="figures text-foreground">{last.result.index}</span>{' '}
                  already holds a run of {last.result.previous}, so it doesn’t change.
                </>
              )}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Add an IP to see how it’s hashed and which bucket it updates.
          </p>
        )}
      </div>

      <div className="space-y-2.5">
        <div className="flex items-baseline justify-between gap-3">
          <Eyebrow>Buckets</Eyebrow>
          <span className="text-xs text-muted-foreground">darker = longer run</span>
        </div>
        <RegisterMap
          registers={sketch.registers}
          version={version}
          highlight={last?.result.index ?? null}
        />
      </div>

      <LineChart
        title="Estimate error as the count grows · shaded band is ±1.04/√m"
        data={history}
        xScale="log"
        xDomain={[1, xMax]}
        xTicks={xTicks}
        formatX={compact}
        yDomain={[-yMax, yMax]}
        yTicks={[-2 * sigma, -sigma, 0, sigma, 2 * sigma].filter((t) => Math.abs(t) <= yMax)}
        formatY={(y) => `${y > 0 ? '+' : ''}${percent(y, 1)}`}
        bands={[{ y0: -sigma, y1: sigma }]}
        height={200}
      />
    </Demo>
  );
}
