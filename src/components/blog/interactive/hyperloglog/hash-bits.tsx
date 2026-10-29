import { cn } from '@/lib/utils';
import type { Anatomy } from './hll';

/** A 32-bit hash with the bucket bits, the run of zeros and the first 1 marked. */
export function HashBits({ hash, index, rho, p }: Anatomy & { p: number }) {
  const bits = hash.toString(2).padStart(32, '0');
  const firstOne = p + rho - 1;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-16 gap-0.5 font-mono text-xs sm:grid-cols-32">
        {[...bits].map((bit, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: bit positions are fixed
            key={i}
            className={cn(
              'flex h-7 items-center justify-center rounded-sm',
              i < p && 'bg-primary/15 text-primary',
              i >= p && i < firstOne && 'bg-amber/15 text-amber',
              i === firstOne && 'bg-amber font-semibold text-card',
              i > firstOne && 'bg-edge/[0.04] text-muted-foreground/60'
            )}
          >
            {bit}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-primary/40" />
          first {p} bits → bucket <span className="figures text-foreground">{index}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-amber" />
          {rho - 1} leading {rho === 2 ? 'zero' : 'zeros'}, then a 1 → run length{' '}
          <span className="figures text-foreground">{rho}</span>
        </span>
      </div>
    </div>
  );
}
