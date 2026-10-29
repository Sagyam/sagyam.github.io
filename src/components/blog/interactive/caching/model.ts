export type Strategy =
  | 'cache-aside'
  | 'read-through'
  | 'write-through'
  | 'write-back'
  | 'write-around'
  | 'refresh-ahead';

export type NodeName = 'app' | 'cache' | 'db';

interface StrategyConfig {
  title: string;
  /** Who fetches from the database on a miss: the app (aside) or the cache (through). */
  reads: 'aside' | 'through';
  writes: 'invalidate' | 'through' | 'back' | 'around';
  readsLabel: string;
  writesLabel: string;
  refresh?: boolean;
  newRecord?: boolean;
  crash?: boolean;
  caption: string;
}

export const STRATEGIES: Record<Strategy, StrategyConfig> = {
  'cache-aside': {
    title: 'Cache-aside',
    reads: 'aside',
    writes: 'invalidate',
    readsLabel: 'app checks cache, then DB',
    writesLabel: 'DB, then invalidate',
    caption:
      'The cache never talks to the database: on a miss, the app fetches the row and fills the cache itself.',
  },
  'read-through': {
    title: 'Read-through',
    reads: 'through',
    writes: 'through',
    readsLabel: 'cache loads from DB',
    writesLabel: 'write-through',
    caption:
      'The app only ever talks to the cache. On a miss, the cache fetches from the database on its behalf.',
  },
  'write-through': {
    title: 'Write-through',
    reads: 'through',
    writes: 'through',
    readsLabel: 'read-through',
    writesLabel: 'cache and DB, synchronously',
    newRecord: true,
    caption:
      'A write is only acknowledged once both the cache and the database have it. Watch the latency: every write pays for the database.',
  },
  'write-back': {
    title: 'Write-back',
    reads: 'through',
    writes: 'back',
    readsLabel: 'read-through',
    writesLabel: 'cache now, DB in a batch later',
    crash: true,
    caption:
      'Writes are acknowledged as soon as the cache has them. Unsaved entries are flushed to the database in one batch, five seconds after the first.',
  },
  'write-around': {
    title: 'Write-around',
    reads: 'aside',
    writes: 'around',
    readsLabel: 'cache-aside',
    writesLabel: 'DB only, bypassing the cache',
    newRecord: true,
    caption:
      'Writes skip the cache entirely (a cached copy is dropped so it can’t go stale). Only data that is actually read takes up cache space.',
  },
  'refresh-ahead': {
    title: 'Refresh-ahead',
    reads: 'through',
    writes: 'through',
    readsLabel: 'read-through',
    writesLabel: 'write-through',
    refresh: true,
    caption:
      'Entries live for 12 seconds. A key read recently is reloaded once 60% of its life has passed (the amber part of its bar), so it never expires. Keys nobody reads are left to expire.',
  },
};

export const CAPACITY = 4;
export const TTL = 12;
export const REFRESH_AFTER = TTL * 0.6;
export const FLUSH_DELAY = 5;
/** Simulated latency of one hop, in milliseconds. */
export const HOP_MS = { cache: 1, db: 30 };

export const KEYS = ['user1', 'user2', 'item5', 'item10'];
const SEED: Record<string, string> = {
  user1: 'Alice',
  user2: 'Bob',
  item5: 'Laptop',
  item10: 'Mouse',
};

export interface Entry {
  key: string;
  value: string;
  storedAt: number;
  lastRead: number;
  dirty: boolean;
  refreshing: boolean;
}

export interface LogLine {
  id: number;
  actor: 'App' | 'Cache' | 'DB';
  text: string;
  tone: 'plain' | 'hit' | 'miss' | 'bad';
}

export class CacheModel {
  now = 0;
  /** Least recently used first. */
  cache: Entry[] = [];
  db: Record<string, string> = { ...SEED };
  versions: Record<string, number> = {};
  log: LogLine[] = [];
  flushAt: number | null = null;
  flushing = false;
  records = 0;
  stats = { hits: 0, misses: 0, dbReads: 0, dbWrites: 0, lost: 0 };
  last: { label: string; ms: number; cacheHops: number; dbHops: number } | null = null;
  private logId = 0;

  constructor() {
    for (const key of ['user1', 'item5']) {
      this.put(key, SEED[key]);
      // Pre-warmed, not read: refresh-ahead shouldn't treat these as hot yet.
      (this.get(key) as Entry).lastRead = Number.NEGATIVE_INFINITY;
    }
  }

  get(key: string) {
    return this.cache.find((e) => e.key === key);
  }

  /** Insert or update, most recently used last; returns an evicted entry if the cache was full. */
  put(key: string, value: string, dirty = false): Entry | undefined {
    const existing = this.get(key);
    if (existing) {
      this.cache = [...this.cache.filter((e) => e !== existing), existing];
      Object.assign(existing, { value, storedAt: this.now, dirty: existing.dirty || dirty });
      return undefined;
    }
    let evicted: Entry | undefined;
    if (this.cache.length >= CAPACITY) {
      evicted = this.cache.find((e) => !e.dirty) ?? this.cache[0];
      this.cache = this.cache.filter((e) => e !== evicted);
    }
    this.cache.push({
      key,
      value,
      storedAt: this.now,
      lastRead: this.now,
      dirty,
      refreshing: false,
    });
    return evicted;
  }

  touch(entry: Entry) {
    entry.lastRead = this.now;
    this.cache = [...this.cache.filter((e) => e !== entry), entry];
  }

  remove(key: string) {
    this.cache = this.cache.filter((e) => e.key !== key);
  }

  nextValue(key: string) {
    const version = (this.versions[key] ?? 1) + 1;
    this.versions[key] = version;
    const base = SEED[key] ?? key;
    return `${base} v${version}`;
  }

  say(actor: LogLine['actor'], text: string, tone: LogLine['tone'] = 'plain') {
    this.log = [{ id: this.logId++, actor, text, tone }, ...this.log].slice(0, 6);
  }
}
