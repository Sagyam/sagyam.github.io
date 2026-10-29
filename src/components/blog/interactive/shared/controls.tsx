'use client';

import type { ReactNode } from 'react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface RangeProps {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** What to print beside the label; defaults to the raw value. */
  display?: ReactNode;
  className?: string;
}

export function Range({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  display,
  className,
}: RangeProps) {
  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <span className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="figures text-foreground">{display ?? value}</span>
      </span>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => onChange(next)}
        aria-label={typeof label === 'string' ? label : undefined}
      />
    </div>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (value: T) => void;
  label: string;
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: SegmentedProps<T>) {
  return (
    <fieldset
      aria-label={label}
      className="inline-flex flex-wrap gap-1 rounded-lg border border-edge/10 bg-edge/[0.03] p-1"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            option.value === value
              ? 'bg-card text-foreground shadow-sm ring-1 ring-edge/10'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
        </button>
      ))}
    </fieldset>
  );
}

type Tone = 'default' | 'good' | 'bad' | 'warn';

const toneClass: Record<Tone, string> = {
  default: 'text-foreground',
  good: 'text-success',
  bad: 'text-destructive',
  warn: 'text-amber',
};

interface StatProps {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  tone?: Tone;
}

export function Stat({ label, value, hint, tone = 'default' }: StatProps) {
  return (
    <div className="min-w-0 rounded-lg border border-edge/10 bg-edge/[0.02] px-3 py-2.5">
      <div className="truncate text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className={cn('figures mt-1 truncate text-lg font-medium', toneClass[tone])}>
        {value}
      </div>
      {hint && <div className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

/** Small uppercase label above a group of controls or a visual. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'text-[11px] font-medium uppercase tracking-widest text-muted-foreground',
        className
      )}
    >
      {children}
    </div>
  );
}
