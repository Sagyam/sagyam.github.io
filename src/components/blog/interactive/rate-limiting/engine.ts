/*
 * Rate limiters as pure state machines over simulated time (seconds), plus the request
 * simulation the demos draw. Requests are decided at their exact arrival time, not per frame,
 * so behaviour doesn't depend on the frame rate.
 */

export type Decision = 'accept' | 'drop' | 'queue';

export interface Release {
  id: number;
  t: number;
}

export interface Limiter {
  /** Decide a request arriving at `t`. Calls come in time order. */
  offer(id: number, t: number): Decision;
  /** Queued requests that leave the limiter up to `t` (leaky bucket only). */
  release(t: number): Release[];
}

export class TokenBucket implements Limiter {
  private tokens: number;
  private last = 0;

  constructor(
    public capacity: number,
    public rate: number
  ) {
    this.tokens = capacity;
  }

  /** Tokens available at `t`, refilled continuously. */
  level(t: number) {
    return Math.min(this.capacity, this.tokens + Math.max(t - this.last, 0) * this.rate);
  }

  configure(capacity: number, rate: number, t: number) {
    this.tokens = Math.min(this.level(t), capacity);
    this.last = t;
    this.capacity = capacity;
    this.rate = rate;
  }

  offer(_id: number, t: number): Decision {
    this.tokens = this.level(t);
    this.last = t;
    if (this.tokens < 1) return 'drop';
    this.tokens -= 1;
    return 'accept';
  }

  release() {
    return [];
  }
}

export class LeakyBucket implements Limiter {
  readonly queue: number[] = [];
  private nextLeak = 0;

  constructor(
    public capacity: number,
    public rate: number
  ) {}

  configure(capacity: number, rate: number) {
    this.capacity = capacity;
    this.rate = rate;
  }

  offer(id: number, t: number): Decision {
    if (this.queue.length >= this.capacity) return 'drop';
    // An empty bucket lets the next request straight through.
    if (this.queue.length === 0) this.nextLeak = Math.max(this.nextLeak, t);
    this.queue.push(id);
    return 'queue';
  }

  release(t: number) {
    const out: Release[] = [];
    while (this.queue.length > 0 && this.nextLeak <= t) {
      out.push({ id: this.queue.shift() as number, t: this.nextLeak });
      this.nextLeak += 1 / this.rate;
    }
    return out;
  }
}

export class FixedWindow implements Limiter {
  private index = -1;
  private count = 0;

  constructor(
    public limit: number,
    public window: number
  ) {}

  configure(limit: number, window: number) {
    if (window !== this.window) this.index = -1;
    this.limit = limit;
    this.window = window;
  }

  countAt(t: number) {
    return Math.floor(t / this.window) === this.index ? this.count : 0;
  }

  offer(_id: number, t: number): Decision {
    const index = Math.floor(t / this.window);
    if (index !== this.index) {
      this.index = index;
      this.count = 0;
    }
    if (this.count >= this.limit) return 'drop';
    this.count++;
    return 'accept';
  }

  release() {
    return [];
  }
}

export type SlidingMode = 'log' | 'counter';

export class SlidingWindow implements Limiter {
  private log: number[] = [];
  private counts = new Map<number, number>();

  constructor(
    public limit: number,
    public window: number,
    public mode: SlidingMode
  ) {}

  configure(limit: number, window: number, mode: SlidingMode) {
    if (window !== this.window) this.counts.clear();
    this.limit = limit;
    this.window = window;
    this.mode = mode;
  }

  /** The counter variant's parts: previous window's count, its weight, and the current count. */
  parts(t: number) {
    const index = Math.floor(t / this.window);
    const elapsed = t / this.window - index;
    return {
      previous: this.counts.get(index - 1) ?? 0,
      weight: 1 - elapsed,
      current: this.counts.get(index) ?? 0,
    };
  }

  /** Requests counted against the limit at `t`: exact for the log, weighted for the counter. */
  load(t: number) {
    if (this.mode === 'log') return this.log.filter((x) => x > t - this.window).length;
    const { previous, weight, current } = this.parts(t);
    return previous * weight + current;
  }

  offer(_id: number, t: number): Decision {
    this.log = this.log.filter((x) => x > t - 2 * this.window);
    if (this.load(t) >= this.limit) return 'drop';
    this.log.push(t);
    const index = Math.floor(t / this.window);
    this.counts.set(index, (this.counts.get(index) ?? 0) + 1);
    this.counts.delete(index - 2);
    return 'accept';
  }

  release() {
    return [];
  }
}

/** The window-length stretch holding the most of `times` (sorted), by two pointers. */
export function busiestSpan(times: number[], length: number) {
  let best = { from: 0, count: 0 };
  let lo = 0;
  for (let hi = 0; hi < times.length; hi++) {
    // The epsilon keeps evenly spaced events (say every 1/3 s) from counting one extra.
    while (times[hi] - times[lo] >= length - 1e-9) lo++;
    if (hi - lo + 1 > best.count) best = { from: times[lo], count: hi - lo + 1 };
  }
  return best;
}

export interface Packet {
  id: number;
  sentAt: number;
  arriveAt: number;
  decision?: Decision;
  /** When it left the limiter for the server. */
  departAt?: number;
}

/** How long the demos keep finished requests around: a little more than the timeline shows. */
const HISTORY = 12;

export class Simulation {
  now = 0;
  packets: Packet[] = [];
  accepted = 0;
  dropped = 0;
  served = 0;
  totalWait = 0;
  private nextId = 0;
  private byId = new Map<number, Packet>();

  constructor(
    readonly limiter: Limiter,
    /** Seconds a request takes from client to limiter, and from limiter to server. */
    readonly travel: number
  ) {}

  send(t: number) {
    const packet: Packet = { id: this.nextId++, sentAt: t, arriveAt: t + this.travel };
    this.packets.push(packet);
    this.byId.set(packet.id, packet);
    const previous = this.packets.at(-2);
    if (previous && previous.arriveAt > packet.arriveAt) {
      this.packets.sort((a, b) => a.arriveAt - b.arriveAt);
    }
  }

  advance(to: number) {
    for (const p of this.packets) {
      if (p.arriveAt > to) break;
      if (p.decision) continue;
      this.applyReleases(this.limiter.release(p.arriveAt));
      p.decision = this.limiter.offer(p.id, p.arriveAt);
      if (p.decision === 'drop') {
        this.dropped++;
      } else {
        this.accepted++;
        if (p.decision === 'accept') {
          p.departAt = p.arriveAt;
          this.served++;
        }
      }
    }
    this.applyReleases(this.limiter.release(to));
    this.now = to;

    const cutoff = to - HISTORY;
    if (this.packets.length > 0 && this.packets[0].arriveAt < cutoff) {
      this.packets = this.packets.filter((p) => {
        const keep = p.arriveAt >= cutoff || (p.decision === 'queue' && p.departAt === undefined);
        if (!keep) this.byId.delete(p.id);
        return keep;
      });
    }
  }

  private applyReleases(releases: Release[]) {
    for (const { id, t } of releases) {
      const p = this.byId.get(id);
      if (!p) continue;
      p.departAt = t;
      this.served++;
      this.totalWait += t - p.arriveAt;
    }
  }
}

/** Where requests come from: one-off schedules (bursts) plus optional Poisson background traffic. */
export class Traffic {
  private queued: number[] = [];
  private rate = 0;
  private nextRandom = Number.POSITIVE_INFINITY;

  setRate(rate: number, now: number) {
    this.rate = rate;
    this.nextRandom = rate > 0 ? now + this.gap() : Number.POSITIVE_INFINITY;
  }

  schedule(times: number[]) {
    this.queued.push(...times);
    this.queued.sort((a, b) => a - b);
  }

  clear() {
    this.queued = [];
  }

  /** Every send due up to `to`, in order. */
  take(to: number): number[] {
    const out: number[] = [];
    while (this.queued.length > 0 && this.queued[0] <= to) out.push(this.queued.shift() as number);
    while (this.nextRandom <= to) {
      out.push(this.nextRandom);
      this.nextRandom += this.gap();
    }
    return out.sort((a, b) => a - b);
  }

  private gap() {
    return -Math.log(1 - Math.random()) / this.rate;
  }
}
