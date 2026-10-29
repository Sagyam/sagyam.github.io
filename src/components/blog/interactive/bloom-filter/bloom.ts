import { murmur3 } from '../shared/hash';

/**
 * The k bit positions an item maps to, by double hashing: h1 + i·h2 mod m.
 * Two good hashes stand in for k independent ones (Kirsch & Mitzenmacher).
 */
export function positions(item: string, m: number, k: number): number[] {
  const h1 = murmur3(item, 0x9747b28c);
  const h2 = murmur3(item, 0x5bd1e995) | 1;
  return Array.from({ length: k }, (_, i) => (h1 + i * h2) % m);
}

export function buildBits(items: string[], m: number, k: number): Uint8Array {
  const bits = new Uint8Array(m);
  for (const item of items) for (const p of positions(item, m, k)) bits[p] = 1;
  return bits;
}

/** P(false positive) ≈ (1 − e^(−kn/m))^k */
export function falsePositiveRate(n: number, m: number, k: number): number {
  if (n <= 0 || m <= 0 || k <= 0) return 0;
  return (1 - Math.exp((-k * n) / m)) ** k;
}

export function optimalK(n: number, m: number): number {
  return (m / n) * Math.LN2;
}
