export type RowHash<T> = (row: number, item: T, width: number) => number;

export interface Cell {
  row: number;
  col: number;
}

export class CountMinSketch<T> {
  readonly table: Uint32Array[];

  constructor(
    readonly depth: number,
    readonly width: number,
    private readonly hash: RowHash<T>
  ) {
    this.table = Array.from({ length: depth }, () => new Uint32Array(width));
  }

  cells(item: T): Cell[] {
    return this.table.map((_, row) => ({ row, col: this.hash(row, item, this.width) }));
  }

  add(item: T): Cell[] {
    const cells = this.cells(item);
    for (const { row, col } of cells) this.table[row][col]++;
    return cells;
  }

  /** Each row's counter for the item, and their minimum: the estimate. */
  query(item: T) {
    const values = this.cells(item).map(({ row, col }) => this.table[row][col]);
    return { values, estimate: Math.min(...values) };
  }
}

const PRIMES = [7, 11, 13, 17, 19, 23];
const OFFSETS = [3, 5, 7, 11, 13, 17];

/** Deliberately simple hashes for small integers, so readers can follow them by hand. */
export const digitHash: RowHash<number> = (row, x, width) =>
  (x * PRIMES[row] + OFFSETS[row]) % width;

export const digitHashFormula = (row: number) => `(${PRIMES[row]}x + ${OFFSETS[row]}) mod w`;
