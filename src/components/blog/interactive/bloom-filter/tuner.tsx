'use client';

import { Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';

import { Range } from '../shared/controls';
import { Demo } from '../shared/demo';
import { bitsToSize, chance, compact, grouped } from '../shared/format';
import { LineChart } from '../shared/line-chart';
import { falsePositiveRate, optimalK } from './bloom';

/** 10^e rounded to two significant figures, so slider values read cleanly. */
const fromExp = (e: number) => Number((10 ** e).toPrecision(2));
const sweep = (from: number, to: number, steps: number) =>
  Array.from({ length: steps + 1 }, (_, i) => from + ((to - from) * i) / steps);

const DEFAULTS = { nExp: 6, mExp: 7, k: 7 };

export function BloomTuner() {
  const [nExp, setNExp] = useState(DEFAULTS.nExp);
  const [mExp, setMExp] = useState(DEFAULTS.mExp);
  const [k, setK] = useState(DEFAULTS.k);

  const n = fromExp(nExp);
  const m = fromExp(mExp);
  const p = falsePositiveRate(n, m, k);
  const bestK = optimalK(n, m);
  const bestKRounded = Math.min(Math.max(Math.round(bestK), 1), 30);

  const curves = useMemo(
    () => ({
      byN: sweep(1, 9, 120).map((e) => ({ x: 10 ** e, y: falsePositiveRate(10 ** e, m, k) })),
      byK: sweep(1, 30, 29).map((kk) => ({ x: kk, y: falsePositiveRate(n, m, kk) })),
      byM: sweep(2, 11, 120).map((e) => ({ x: 10 ** e, y: falsePositiveRate(n, 10 ** e, k) })),
    }),
    [n, m, k]
  );

  // The U only shows on a log axis: span the decades the curve actually covers.
  const lowest = Math.min(...curves.byK.map((pt) => pt.y).filter((y) => y > 0));
  const floorExp = Math.max(Math.floor(Math.log10(lowest)), -15);
  const kDomain: [number, number] = [10 ** floorExp, 1];
  const tickStep = Math.max(Math.ceil(-floorExp / 3), 1);
  const kTicks = Array.from(
    { length: Math.floor(-floorExp / tickStep) + 1 },
    (_, i) => 10 ** -(i * tickStep)
  );

  const reset = () => {
    setNExp(DEFAULTS.nExp);
    setMExp(DEFAULTS.mExp);
    setK(DEFAULTS.k);
  };

  const yAxis = {
    yDomain: [0, 1] as [number, number],
    yTicks: [0, 0.5, 1],
    formatY: chance,
  };

  return (
    <Demo
      title="Tuning a Bloom filter"
      onReset={reset}
      caption="The amber dot on each chart is your filter. Each chart varies one parameter and holds the other two where the sliders are."
    >
      <div className="grid gap-5 sm:grid-cols-3">
        <Range
          label="Items (n)"
          value={nExp}
          min={1}
          max={9}
          step={0.05}
          onChange={setNExp}
          display={compact(n)}
        />
        <Range
          label="Filter size (m)"
          value={mExp}
          min={2}
          max={11}
          step={0.05}
          onChange={setMExp}
          display={bitsToSize(m)}
        />
        <Range label="Hash functions (k)" value={k} min={1} max={30} onChange={setK} />
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-edge/10 bg-edge/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Chance of a false positive
          </div>
          <div className="figures mt-1 font-heading text-3xl font-semibold text-foreground">
            {chance(p)}
          </div>
          <div className="figures mt-1 text-xs text-muted-foreground">
            {(m / n).toFixed(1)} bits per item · {grouped(m)} bits total
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div className="text-sm text-muted-foreground">
            Best k for this n and m:{' '}
            <span className="figures text-foreground">{bestK.toFixed(1)}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setK(bestKRounded)}
            disabled={k === bestKRounded}
          >
            <Sparkles /> Use k = {bestKRounded}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <LineChart
          title="vs. number of items"
          data={curves.byN}
          xScale="log"
          xDomain={[10, 1e9]}
          xTicks={[10, 1e3, 1e5, 1e7, 1e9]}
          formatX={compact}
          marker={{ x: n, y: p }}
          {...yAxis}
        />
        <LineChart
          title="vs. hash functions (log scale)"
          data={curves.byK}
          xDomain={[1, 30]}
          xTicks={[1, 10, 20, 30]}
          formatX={(x) => `k=${x}`}
          marker={{ x: k, y: p }}
          yScale="log"
          yDomain={kDomain}
          yTicks={kTicks}
          formatY={chance}
        />
        <LineChart
          title="vs. filter size (bits)"
          data={curves.byM}
          xScale="log"
          xDomain={[100, 1e11]}
          xTicks={[100, 1e4, 1e6, 1e8, 1e10]}
          formatX={compact}
          marker={{ x: m, y: p }}
          {...yAxis}
        />
      </div>
    </Demo>
  );
}
