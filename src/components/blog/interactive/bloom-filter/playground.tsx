'use client';

import { Ban, Check, Dices, Search, TriangleAlert } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { Eyebrow, Range, Stat } from '../shared/controls';
import { Demo } from '../shared/demo';
import { chance } from '../shared/format';
import { randomIPv4 } from '../shared/hash';
import { buildBits, falsePositiveRate, positions } from './bloom';

const STARTING_IPS = ['10.0.0.1', '192.168.1.7', '8.8.8.8', '172.16.4.20', '203.0.113.9'];

export function BloomPlayground() {
  const [m, setM] = useState(32);
  const [k, setK] = useState(3);
  const [banned, setBanned] = useState(STARTING_IPS);
  const [banInput, setBanInput] = useState('');
  const [checkInput, setCheckInput] = useState('');
  const [checked, setChecked] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [tally, setTally] = useState({ checks: 0, falsePositives: 0 });

  const bits = useMemo(() => buildBits(banned, m, k), [banned, m, k]);
  const setCount = bits.reduce((sum, b) => sum + b, 0);
  const hoveredBits = hovered ? new Set(positions(hovered, m, k)) : null;
  const probe = checked ? positions(checked, m, k) : null;
  const probeSet = new Set(probe);

  const ban = (ips: string[]) => {
    const fresh = ips.map((ip) => ip.trim()).filter((ip) => ip && !banned.includes(ip));
    if (fresh.length > 0) setBanned((prev) => [...prev, ...fresh]);
  };

  const onBan = (event: FormEvent) => {
    event.preventDefault();
    ban([banInput]);
    setBanInput('');
  };

  const onCheck = (event: FormEvent) => {
    event.preventDefault();
    const ip = checkInput.trim();
    if (!ip) return;
    setChecked(ip);
    const all = positions(ip, m, k).every((p) => bits[p]);
    setTally((t) => ({
      checks: t.checks + 1,
      falsePositives: t.falsePositives + (all && !banned.includes(ip) ? 1 : 0),
    }));
  };

  const reset = () => {
    setM(32);
    setK(3);
    setBanned(STARTING_IPS);
    setChecked(null);
    setCheckInput('');
    setTally({ checks: 0, falsePositives: 0 });
  };

  const rate = falsePositiveRate(banned.length, m, k);

  return (
    <Demo
      title="Bloom filter"
      onReset={reset}
      caption="Hover a banned IP to see the bits it set. Changing m or k rebuilds the filter from the same list."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Range
          label="Bits in the filter (m)"
          value={m}
          min={16}
          max={64}
          step={4}
          onChange={setM}
        />
        <Range label="Hash functions (k)" value={k} min={1} max={6} onChange={setK} />
      </div>

      <div className="space-y-2.5">
        <Eyebrow>Banned IPs · {banned.length}</Eyebrow>
        <div className="flex flex-wrap gap-1.5">
          {banned.map((ip) => (
            <button
              key={ip}
              type="button"
              onMouseEnter={() => setHovered(ip)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(ip)}
              onBlur={() => setHovered(null)}
              className={cn(
                'rounded-full border px-2.5 py-1 font-mono text-xs transition-colors',
                hovered === ip
                  ? 'border-amber bg-amber/10 text-foreground'
                  : 'border-edge/10 bg-edge/[0.03] text-muted-foreground'
              )}
            >
              {ip}
            </button>
          ))}
        </div>
        <form onSubmit={onBan} className="flex flex-wrap gap-2">
          <Input
            value={banInput}
            onChange={(e) => setBanInput(e.target.value)}
            placeholder="Ban an IP, e.g. 1.2.3.4"
            className="h-9 min-w-40 flex-1 font-mono text-sm"
            aria-label="IP to ban"
          />
          <Button type="submit" size="sm" variant="outline">
            <Ban /> Ban
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => ban(Array.from({ length: 5 }, randomIPv4))}
          >
            <Dices /> Ban 5 random
          </Button>
        </form>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-baseline justify-between gap-3">
          <Eyebrow>Bit array</Eyebrow>
          <span className="figures text-xs text-muted-foreground">
            {setCount} of {m} set
          </span>
        </div>
        <div className="grid grid-cols-8 gap-1 sm:grid-cols-16">
          {Array.from(bits, (bit, i) => {
            const probed = probeSet.has(i);
            return (
              <div
                // The index is the bit's identity; adding the value replays the entry animation when it flips on.
                // biome-ignore lint/suspicious/noArrayIndexKey: bits are positional
                key={`${i}-${bit}`}
                title={`bit ${i}`}
                className={cn(
                  'relative flex aspect-square items-center justify-center rounded-md font-mono text-sm transition-shadow',
                  bit
                    ? 'animate-in zoom-in-75 bg-primary text-primary-foreground duration-300'
                    : 'bg-edge/[0.05] text-muted-foreground/70',
                  hoveredBits?.has(i) && 'ring-2 ring-amber ring-offset-1 ring-offset-card',
                  probed &&
                    (bit
                      ? 'ring-2 ring-amber ring-offset-1 ring-offset-card'
                      : 'ring-2 ring-destructive ring-offset-1 ring-offset-card')
                )}
              >
                {bit}
                <span className="absolute right-0.5 bottom-0 text-[8px] opacity-60">{i}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        <Eyebrow>Look up an IP</Eyebrow>
        <form onSubmit={onCheck} className="flex flex-wrap gap-2">
          <Input
            value={checkInput}
            onChange={(e) => setCheckInput(e.target.value)}
            placeholder="Is this IP banned?"
            className="h-9 min-w-40 flex-1 font-mono text-sm"
            aria-label="IP to look up"
          />
          <Button type="submit" size="sm">
            <Search /> Check
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setCheckInput(randomIPv4())}
          >
            <Dices /> Random IP
          </Button>
        </form>
        {checked && probe && (
          <Verdict
            item={checked}
            probe={probe}
            bits={bits}
            banned={banned}
            m={m}
            k={k}
            rate={rate}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Items (n)" value={banned.length} />
        <Stat label="Bits set" value={`${Math.round((setCount / m) * 100)}%`} />
        <Stat
          label="False positive odds"
          value={chance(rate)}
          tone={rate > 0.1 ? 'warn' : 'default'}
        />
        <Stat
          label="Fooled it"
          value={`${tally.falsePositives} / ${tally.checks}`}
          hint="false positives / checks"
          tone={tally.falsePositives > 0 ? 'warn' : 'default'}
        />
      </div>
    </Demo>
  );
}

interface VerdictProps {
  item: string;
  probe: number[];
  bits: Uint8Array;
  banned: string[];
  m: number;
  k: number;
  rate: number;
}

function Verdict({ item, probe, bits, banned, m, k, rate }: VerdictProps) {
  const unique = [...new Set(probe)];
  const zero = unique.find((p) => !bits[p]);
  const list = unique.map((p) => `${p}`).join(', ');

  if (zero !== undefined) {
    return (
      <Panel tone="good" icon={<Check className="size-4" />} title="Definitely not banned">
        <span className="font-mono">{item}</span> hashes to bits {list}. Bit {zero} is 0, so it was
        never added. A Bloom filter is never wrong about this.
      </Panel>
    );
  }

  if (banned.includes(item)) {
    return (
      <Panel tone="info" icon={<Ban className="size-4" />} title="Probably banned">
        All of bits {list} are 1, and <span className="font-mono">{item}</span> really is on the
        list. The filter can only say “probably”: it can’t tell this apart from a false positive.
      </Panel>
    );
  }

  const culprits = unique.map((p) => ({
    bit: p,
    by: banned.filter((ip) => positions(ip, m, k).includes(p)),
  }));
  return (
    <Panel tone="warn" icon={<TriangleAlert className="size-4" />} title="False positive!">
      <span className="font-mono">{item}</span> was never banned, yet all of bits {list} are 1.
      Other IPs set them:
      <ul className="mt-1.5 space-y-0.5 font-mono text-xs">
        {culprits.map(({ bit, by }) => (
          <li key={bit}>
            bit {bit} ← {by.join(', ')}
          </li>
        ))}
      </ul>
      <div className="mt-1.5">The formula gave this a {chance(rate)} chance.</div>
    </Panel>
  );
}

const panelTone = {
  good: 'border-success/30 bg-success/5 [&_[data-icon]]:text-success',
  info: 'border-primary/30 bg-primary/5 [&_[data-icon]]:text-primary',
  warn: 'border-amber/40 bg-amber/10 [&_[data-icon]]:text-amber',
};

function Panel({
  tone,
  icon,
  title,
  children,
}: {
  tone: keyof typeof panelTone;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-live="polite"
      className={cn(
        'animate-in fade-in rounded-lg border p-3.5 text-sm leading-relaxed text-muted-foreground duration-300',
        panelTone[tone]
      )}
    >
      <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
        <span data-icon>{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}
