'use client';

import { Dices } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Range } from '../shared/controls';
import { Demo } from '../shared/demo';
import { grouped } from '../shared/format';
import { randomIPv4 } from '../shared/hash';
import { HashBits } from './hash-bits';
import { anatomy, hashOf } from './hll';

export function HllAnatomy() {
  const [value, setValue] = useState('192.168.0.1');
  const [p, setP] = useState(4);
  const a = anatomy(hashOf(value), p);

  return (
    <Demo
      title="Splitting a hash"
      onReset={() => {
        setValue('192.168.0.1');
        setP(4);
      }}
      caption="Type anything. The hash changes completely with every keystroke, but the split stays the same."
    >
      <div className="grid gap-5 sm:grid-cols-[1fr_14rem] sm:items-end">
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-9 font-mono text-sm"
            aria-label="Value to hash"
          />
          <Button size="sm" variant="outline" onClick={() => setValue(randomIPv4())}>
            <Dices /> Random
          </Button>
        </div>
        <Range
          label="Index bits (p)"
          value={p}
          min={2}
          max={8}
          onChange={setP}
          display={`${2 ** p} buckets`}
        />
      </div>

      <HashBits {...a} p={p} />

      <p className="text-sm leading-relaxed text-muted-foreground">
        <span className="font-mono text-foreground">{value || '""'}</span> goes to bucket{' '}
        <span className="figures text-foreground">{a.index}</span> of {2 ** p}. Its run length is{' '}
        <span className="figures text-foreground">{a.rho}</span>, a 1-in-
        {grouped(2 ** a.rho)} sight, so on its own this bucket guesses it has seen about{' '}
        <span className="figures text-foreground">
          2<sup>{a.rho}</sup> = {grouped(2 ** a.rho)}
        </span>{' '}
        distinct items. The bucket keeps the longest run it has ever seen.
      </p>
    </Demo>
  );
}
