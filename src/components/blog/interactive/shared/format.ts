const units = [
  { at: 1e12, suffix: 'T' },
  { at: 1e9, suffix: 'B' },
  { at: 1e6, suffix: 'M' },
  { at: 1e3, suffix: 'K' },
];

/** 1234 → "1.2K", 5_000_000 → "5M". */
export function compact(n: number): string {
  const abs = Math.abs(n);
  for (const { at, suffix } of units) {
    if (abs >= at) {
      const v = n / at;
      return `${Number(v.toFixed(Math.abs(v) < 10 ? 1 : 0))}${suffix}`;
    }
  }
  return `${Math.round(n)}`;
}

export function grouped(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

/** A probability as a percentage, switching to "1 in N" when it gets small. */
export function chance(p: number): string {
  if (!Number.isFinite(p) || p <= 0) return '0%';
  if (p >= 0.001) return `${Number((p * 100).toPrecision(3))}%`;
  return `1 in ${compact(1 / p)}`;
}

export function percent(p: number, digits = 1): string {
  return `${(p * 100).toFixed(digits)}%`;
}

/** Bits → "512 bits", "1.5 KB", "1.2 GB" (decimal units). */
export function bitsToSize(bits: number): string {
  if (bits < 8 * 1000) return `${grouped(bits)} bits`;
  const bytes = bits / 8;
  const scale = [
    { at: 1e12, unit: 'TB' },
    { at: 1e9, unit: 'GB' },
    { at: 1e6, unit: 'MB' },
    { at: 1e3, unit: 'KB' },
  ].find((s) => bytes >= s.at);
  if (!scale) return `${grouped(bytes)} B`;
  const v = bytes / scale.at;
  return `${Number(v.toFixed(v < 10 ? 1 : 0))} ${scale.unit}`;
}
