import { cn } from '@/lib/utils';

export const SPAN = 10;

export type TickTone = 'accept' | 'drop' | 'neutral';

export interface TimelineRow {
  label: string;
  ticks: { t: number; tone: TickTone }[];
}

export interface TimelineBand {
  from: number;
  to: number;
  label?: string;
  tone: 'stripe' | 'plain' | 'focus' | 'over';
}

const tickTone: Record<TickTone, string> = {
  accept: 'bg-success',
  drop: 'bg-destructive',
  neutral: 'bg-primary',
};

const bandTone: Record<TimelineBand['tone'], string> = {
  stripe: 'bg-edge/[0.04]',
  plain: '',
  focus: 'bg-amber/15 ring-1 ring-inset ring-amber/50',
  over: 'bg-destructive/10 ring-1 ring-inset ring-destructive/40',
};

/** The last ten seconds, with "now" at the right edge. */
export function Timeline({
  now,
  rows,
  bands = [],
  axis = true,
  compact = false,
}: {
  now: number;
  rows: TimelineRow[];
  bands?: TimelineBand[];
  axis?: boolean;
  compact?: boolean;
}) {
  const start = now - SPAN;
  const x = (t: number) => `${((t - start) / SPAN) * 100}%`;
  const width = (from: number, to: number) => `${((to - from) / SPAN) * 100}%`;

  return (
    <div className="grid grid-cols-[3.25rem_1fr] gap-x-2">
      <div className="flex flex-col">
        {bands.some((b) => b.label) && <div className="h-4" />}
        {rows.map((row) => (
          <div
            key={row.label}
            className={cn(
              'flex items-center text-[11px] text-muted-foreground',
              compact ? 'h-5' : 'h-7'
            )}
          >
            {row.label}
          </div>
        ))}
      </div>
      <div className="relative overflow-hidden">
        {bands.some((b) => b.label) && <div className="h-4" />}
        <div className="pointer-events-none absolute inset-0">
          {bands.map((b) => {
            const from = Math.max(b.from, start);
            const to = Math.min(b.to, now);
            if (to <= from) return null;
            return (
              <div
                key={`${b.from}-${b.to}-${b.tone}`}
                className={cn('absolute inset-y-0 rounded-sm', bandTone[b.tone])}
                style={{ left: x(from), width: width(from, to) }}
              >
                {b.label && (
                  <span
                    className={cn(
                      'figures absolute text-[10px] whitespace-nowrap',
                      b.tone === 'over'
                        ? 'right-1 bottom-0 font-medium text-destructive'
                        : 'top-0 left-1 text-muted-foreground'
                    )}
                  >
                    {b.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {rows.map((row) => (
          <div
            key={row.label}
            className={cn('relative border-b border-edge/10', compact ? 'h-5' : 'h-7')}
          >
            {row.ticks.map((tick, i) =>
              tick.t < start || tick.t > now ? null : (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: ticks are drawn fresh every frame
                  key={i}
                  className={cn(
                    'absolute bottom-1 w-[3px] -translate-x-1/2 rounded-full',
                    compact ? 'top-1' : 'top-1.5',
                    tickTone[tick.tone]
                  )}
                  style={{ left: x(tick.t) }}
                />
              )
            )}
          </div>
        ))}
      </div>
      {axis && (
        <>
          <div />
          <div className="figures mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>−10s</span>
            <span>−5s</span>
            <span>now</span>
          </div>
        </>
      )}
    </div>
  );
}
