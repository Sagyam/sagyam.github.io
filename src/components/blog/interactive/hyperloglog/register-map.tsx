'use client';

import { type PointerEvent, useEffect, useRef, useState } from 'react';

import { useWidth } from '../shared/hooks';

interface RegisterMapProps {
  registers: Uint8Array;
  /** Bumped whenever registers change in place. */
  version: number;
  highlight: number | null;
}

/** Every bucket as a cell, shaded by the longest run it holds. Canvas, so 4,096 buckets stay cheap. */
export function RegisterMap({ registers, version, highlight }: RegisterMapProps) {
  const [wrapRef, width] = useWidth<HTMLDivElement>(640);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [theme, setTheme] = useState(0);

  const m = registers.length;
  const p = Math.log2(m);
  const cols = 2 ** Math.ceil((p + 2) / 2);
  const rows = m / cols;
  const cell = Math.max(Math.min(Math.floor(width / cols), 40), 3);
  const height = rows * cell;

  // Canvas can't follow CSS variables on its own; repaint when the theme class flips.
  useEffect(() => {
    const observer = new MutationObserver(() => setTheme((t) => t + 1));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: version and theme signal in-place changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cols * cell * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const css = getComputedStyle(canvas);
    const color = (name: string) => css.getPropertyValue(name).trim();
    const primary = color('--primary');
    const edge = color('--edge');
    const card = color('--card');
    const foreground = color('--foreground');
    const amber = color('--amber');

    let max = 1;
    for (const v of registers) if (v > max) max = v;
    const gap = cell >= 8 ? 1.5 : cell >= 5 ? 1 : 0;
    ctx.font = `${Math.min(cell * 0.42, 13)}px ${css.getPropertyValue('--font-mono') || 'monospace'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < m; i++) {
      const v = registers[i];
      const x = (i % cols) * cell;
      const y = Math.floor(i / cols) * cell;
      const strength = v / max;
      ctx.globalAlpha = v === 0 ? 0.06 : 0.15 + 0.85 * strength;
      ctx.fillStyle = v === 0 ? edge : primary;
      ctx.fillRect(x + gap / 2, y + gap / 2, cell - gap, cell - gap);
      if (cell >= 22 && v > 0) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = strength > 0.55 ? card : foreground;
        ctx.fillText(String(v), x + cell / 2, y + cell / 2 + 0.5);
      }
    }
    ctx.globalAlpha = 1;
    if (highlight !== null && highlight < m) {
      ctx.strokeStyle = amber;
      ctx.lineWidth = 2;
      ctx.strokeRect(
        (highlight % cols) * cell + 1,
        Math.floor(highlight / cols) * cell + 1,
        cell - 2,
        cell - 2
      );
    }
  }, [registers, version, highlight, cell, cols, height, m, theme]);

  const onMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const col = Math.floor((event.clientX - rect.left) / cell);
    const row = Math.floor((event.clientY - rect.top) / cell);
    const i = row * cols + col;
    setHover(col >= 0 && col < cols && i >= 0 && i < m ? i : null);
  };

  const shown = hover ?? highlight;

  return (
    <div ref={wrapRef} className="space-y-2">
      <canvas
        ref={canvasRef}
        style={{ width: cols * cell, height }}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`${m} buckets, shaded by the longest run each has seen`}
        className="block max-w-full"
      />
      <div className="figures h-4 text-xs text-muted-foreground">
        {shown === null ? (
          'Hover a bucket'
        ) : (
          <>
            {hover === null ? 'Last touched: ' : ''}bucket{' '}
            <span className="text-foreground">{shown}</span> · longest run{' '}
            <span className="text-foreground">{registers[shown]}</span>
          </>
        )}
      </div>
    </div>
  );
}
