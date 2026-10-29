import { murmur3 } from '../shared/hash';

export interface Anatomy {
  hash: number;
  /** Bucket, read from the first p bits. */
  index: number;
  /** Position of the first 1 in the remaining 32 − p bits (leading zeros + 1). */
  rho: number;
}

/** Split a 32-bit hash the way HyperLogLog does. */
export function anatomy(hash: number, p: number): Anatomy {
  const index = hash >>> (32 - p);
  const rest = (hash << p) >>> 0;
  const maxRho = 32 - p + 1;
  const rho = rest === 0 ? maxRho : Math.min(Math.clz32(rest) + 1, maxRho);
  return { hash, index, rho };
}

export const hashOf = (value: string) => murmur3(value, 0);

export interface AddResult extends Anatomy {
  previous: number;
  updated: boolean;
}

function alpha(m: number) {
  if (m === 16) return 0.673;
  if (m === 32) return 0.697;
  if (m === 64) return 0.709;
  return 0.7213 / (1 + 1.079 / m);
}

export class HyperLogLog {
  readonly m: number;
  readonly registers: Uint8Array;
  // Kept incrementally so estimating is O(1), even mid-way through 100K inserts.
  private inverseSum: number;
  private zeros: number;

  constructor(readonly p: number) {
    this.m = 2 ** p;
    this.registers = new Uint8Array(this.m);
    this.inverseSum = this.m;
    this.zeros = this.m;
  }

  add(value: string): AddResult {
    const a = anatomy(hashOf(value), this.p);
    const previous = this.registers[a.index];
    const updated = a.rho > previous;
    if (updated) {
      this.inverseSum += 2 ** -a.rho - 2 ** -previous;
      if (previous === 0) this.zeros--;
      this.registers[a.index] = a.rho;
    }
    return { ...a, previous, updated };
  }

  estimate(): number {
    const { m } = this;
    const raw = (alpha(m) * m * m) / this.inverseSum;
    // Small range: while buckets are still empty, linear counting is more accurate.
    if (raw <= 2.5 * m && this.zeros > 0) return m * Math.log(m / this.zeros);
    // Large range: correct for collisions as n nears the 32-bit hash space.
    const space = 2 ** 32;
    if (raw > space / 30) return -space * Math.log(1 - raw / space);
    return raw;
  }

  get standardError() {
    return 1.04 / Math.sqrt(this.m);
  }
}
