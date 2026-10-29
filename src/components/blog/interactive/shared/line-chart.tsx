'use client';

import { type PointerEvent, useState } from 'react';
import { useWidth } from './hooks';

export interface Point {
  x: number;
  y: number;
}

interface LineChartProps {
  title: string;
  data: Point[];
  xDomain: [number, number];
  yDomain: [number, number];
  xTicks: number[];
  yTicks: number[];
  formatX: (x: number) => string;
  formatY: (y: number) => string;
  xScale?: 'linear' | 'log';
  yScale?: 'linear' | 'log';
  /** The reader's current setting, drawn as a ringed dot with a guide line. */
  marker?: Point;
  /** Horizontal bands, e.g. an expected error range. */
  bands?: { y0: number; y1: number; label?: string }[];
  height?: number;
}

const PAD = { top: 12, right: 14, bottom: 26, left: 44 };

export function LineChart({
  title,
  data,
  xDomain,
  yDomain,
  xTicks,
  yTicks,
  formatX,
  formatY,
  xScale = 'linear',
  yScale = 'linear',
  marker,
  bands = [],
  height = 180,
}: LineChartProps) {
  const [ref, width] = useWidth<HTMLDivElement>(320);
  const [hover, setHover] = useState<Point | null>(null);

  const innerW = Math.max(width - PAD.left - PAD.right, 10);
  const innerH = height - PAD.top - PAD.bottom;
  const tx = xScale === 'log' ? Math.log10 : (v: number) => v;
  const [x0, x1] = [tx(xDomain[0]), tx(xDomain[1])];
  const sx = (x: number) => PAD.left + ((tx(x) - x0) / (x1 - x0)) * innerW;
  const ty = yScale === 'log' ? Math.log10 : (v: number) => v;
  const [y0, y1] = [ty(yDomain[0]), ty(yDomain[1])];
  const sy = (y: number) => {
    const clamped = Math.min(Math.max(y, yDomain[0]), yDomain[1]);
    return PAD.top + innerH - ((ty(clamped) - y0) / (y1 - y0)) * innerH;
  };

  const path = data
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`)
    .join('');

  const onMove = (event: PointerEvent<SVGRectElement>) => {
    if (data.length === 0) return;
    const px = event.clientX - event.currentTarget.getBoundingClientRect().left + PAD.left;
    let best = data[0];
    for (const p of data) if (Math.abs(sx(p.x) - px) < Math.abs(sx(best.x) - px)) best = p;
    setHover(best);
  };

  return (
    <div className="min-w-0">
      <div className="mb-1 text-xs font-medium text-foreground">{title}</div>
      <div ref={ref} className="relative">
        <svg width={width} height={height} role="img" aria-label={title} className="block">
          {yTicks.map((t) => (
            <g key={`y${t}`}>
              <line
                x1={PAD.left}
                x2={PAD.left + innerW}
                y1={sy(t)}
                y2={sy(t)}
                className="stroke-edge/10"
              />
              <text
                x={PAD.left - 6}
                y={sy(t)}
                dy="0.32em"
                textAnchor="end"
                className="fill-muted-foreground font-mono text-[10px]"
              >
                {formatY(t)}
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text
              key={`x${t}`}
              x={sx(t)}
              y={height - 8}
              textAnchor="middle"
              className="fill-muted-foreground font-mono text-[10px]"
            >
              {formatX(t)}
            </text>
          ))}
          {bands.map((b) => (
            <rect
              key={`${b.y0}-${b.y1}`}
              x={PAD.left}
              width={innerW}
              y={sy(b.y1)}
              height={Math.max(sy(b.y0) - sy(b.y1), 0)}
              className="fill-primary/10"
            />
          ))}
          <path
            d={path}
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            className="stroke-chart-1"
          />
          {marker && (
            <g>
              <line
                x1={sx(marker.x)}
                x2={sx(marker.x)}
                y1={PAD.top}
                y2={PAD.top + innerH}
                strokeDasharray="3 3"
                className="stroke-amber/60"
              />
              <circle
                cx={sx(marker.x)}
                cy={sy(marker.y)}
                r={5}
                strokeWidth={2}
                className="fill-amber stroke-card"
              />
            </g>
          )}
          {hover && (
            <g pointerEvents="none">
              <line
                x1={sx(hover.x)}
                x2={sx(hover.x)}
                y1={PAD.top}
                y2={PAD.top + innerH}
                className="stroke-edge/30"
              />
              <circle
                cx={sx(hover.x)}
                cy={sy(hover.y)}
                r={4}
                strokeWidth={2}
                className="fill-chart-1 stroke-card"
              />
            </g>
          )}
          <rect
            x={PAD.left}
            y={PAD.top}
            width={innerW}
            height={innerH}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>
        {hover && (
          <div
            className="pointer-events-none absolute top-0 z-10 rounded-md border border-edge/10 bg-popover px-2 py-1 font-mono text-[11px] whitespace-nowrap text-popover-foreground shadow-md"
            style={{
              left: Math.min(Math.max(sx(hover.x), 60), width - 60),
              transform: 'translateX(-50%)',
            }}
          >
            {formatX(hover.x)} → {formatY(hover.y)}
          </div>
        )}
      </div>
    </div>
  );
}
