'use client';

import { CircleCheck, Dices, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Eyebrow, Range } from '../shared/controls';
import { Demo } from '../shared/demo';
import { CountMinSketch, digitHash, digitHashFormula } from './cms';

const DIGITS = Array.from({ length: 10 }, (_, i) => i);
const STARTING_STREAM = [3, 7, 3, 1, 9, 3, 4];

export function CmsExplorer() {
  const [depth, setDepth] = useState(3);
  const [width, setWidth] = useState(6);
  const [stream, setStream] = useState(STARTING_STREAM);
  const [hovered, setHovered] = useState<number | null>(null);

  // Rebuilt from the stream, so changing the shape replays the same items into the new sketch.
  const sketch = useMemo(() => {
    const s = new CountMinSketch(depth, width, digitHash);
    for (const d of stream) s.add(d);
    return s;
  }, [stream, depth, width]);

  const counts = DIGITS.map((d) => stream.filter((x) => x === d).length);
  const estimates = DIGITS.map((d) => sketch.query(d).estimate);
  const wrong = DIGITS.filter((d) => estimates[d] !== counts[d]);
  const focus = hovered ?? stream.at(-1) ?? null;
  const focusCells = focus === null ? [] : sketch.cells(focus);
  const focusQuery = focus === null ? null : sketch.query(focus);
  const minRow = focusQuery ? focusQuery.values.indexOf(focusQuery.estimate) : -1;

  const add = (digits: number[]) => setStream((prev) => [...prev, ...digits]);
  const random = () => Math.floor(Math.random() * 10);

  return (
    <Demo
      title="Count-Min Sketch"
      onReset={() => {
        setDepth(3);
        setWidth(6);
        setStream(STARTING_STREAM);
      }}
      caption="Changing rows or columns replays everything you've added into a sketch of the new shape."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Range label="Rows (d), one hash each" value={depth} min={1} max={6} onChange={setDepth} />
        <Range label="Columns (w)" value={width} min={4} max={16} onChange={setWidth} />
      </div>

      <div className="space-y-2.5">
        <Eyebrow>Add a digit to the stream · hover one to query it</Eyebrow>
        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
          {DIGITS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => add([d])}
              onMouseEnter={() => setHovered(d)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(d)}
              onBlur={() => setHovered(null)}
              className={cn(
                'flex flex-col items-center rounded-lg border py-1.5 transition-colors',
                focus === d
                  ? 'border-amber bg-amber/10'
                  : 'border-edge/10 bg-edge/[0.03] hover:bg-edge/[0.06]'
              )}
            >
              <span className="font-mono text-lg text-foreground">{d}</span>
              <span className="figures text-[10px] text-muted-foreground">×{counts[d]}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => add([random()])}>
            <Dices /> Random digit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => add(Array.from({ length: 10 }, random))}
          >
            <Dices /> +10 random
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        {sketch.table.map((row, r) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional
            key={r}
            className="grid grid-cols-[4.5rem_1fr] items-center gap-2 sm:grid-cols-[9.5rem_1fr]"
          >
            <span className="font-mono text-[11px] text-muted-foreground">
              h<sub>{r + 1}</sub>
              <span className="hidden sm:inline"> = {digitHashFormula(r)}</span>
              {focus !== null && (
                <span className="text-amber sm:hidden"> → {focusCells[r].col}</span>
              )}
            </span>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}>
              {Array.from(row, (value, c) => {
                const hit = focusCells[r]?.col === c;
                return (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: the value in the key replays the bump animation
                    key={`${c}-${value}`}
                    className={cn(
                      'flex h-9 items-center justify-center rounded-md font-mono text-sm',
                      value > 0
                        ? 'animate-in zoom-in-90 bg-primary/15 text-foreground duration-300'
                        : 'bg-edge/[0.04] text-muted-foreground/60',
                      hit && 'ring-2 ring-amber',
                      hit && r === minRow && 'bg-amber font-semibold text-card'
                    )}
                  >
                    {value}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {focus !== null && focusQuery && (
        <div className="rounded-lg border border-edge/10 bg-edge/[0.02] p-3.5 text-sm leading-relaxed text-muted-foreground">
          Estimate for <span className="font-mono text-foreground">{focus}</span>: min(
          <span className="font-mono">{focusQuery.values.join(', ')}</span>) ={' '}
          <span className="figures font-semibold text-foreground">{focusQuery.estimate}</span>. It
          was actually added <span className="figures text-foreground">{counts[focus]}</span>{' '}
          {counts[focus] === 1 ? 'time' : 'times'}
          {focusQuery.estimate > counts[focus] ? (
            <>
              , so the sketch is over by{' '}
              <span className="figures text-amber">{focusQuery.estimate - counts[focus]}</span>:
              every row it lands in is shared with another digit.
            </>
          ) : (
            <>, and at least one row kept it to itself, so the estimate is exact.</>
          )}
        </div>
      )}

      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Eyebrow>Every digit, actual vs. estimate</Eyebrow>
          {wrong.length === 0 ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-success">
              <CircleCheck className="size-3.5" /> All 10 estimates exact
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber">
              <TriangleAlert className="size-3.5" /> {wrong.length} overestimated, none under
            </span>
          )}
        </div>
        <div className="grid grid-cols-5 gap-1 font-mono text-xs sm:grid-cols-10">
          {DIGITS.map((d) => (
            <div
              key={d}
              className={cn(
                'rounded-md border px-1 py-1.5 text-center',
                estimates[d] > counts[d] ? 'border-amber/40 bg-amber/10' : 'border-edge/10'
              )}
            >
              <div className="text-foreground">{d}</div>
              <div className="text-muted-foreground">
                {counts[d]} / {estimates[d]}
              </div>
            </div>
          ))}
        </div>
        <div className="text-[11px] text-muted-foreground">actual / estimate</div>
      </div>
    </Demo>
  );
}
