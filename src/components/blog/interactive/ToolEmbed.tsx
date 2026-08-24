'use client';

import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface ToolEmbedProps {
  id?: string;
  src?: string;
  title?: string;
  height?: number | string;
}

export function ToolEmbed({ id, src, title, height = 520 }: ToolEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const toolUrl = src || (id ? `https://tools.sagyamthapa.com.np/${id}` : '');

  if (!toolUrl) return null;

  const displayTitle =
    title || id?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Interactive Tool';

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-border/80 bg-black/40 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border/60 bg-white/5 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs font-mono text-muted-foreground">{displayTitle}</span>
        </div>
        <Link
          href={toolUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          Open tool <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
      <div
        className="relative w-full"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="text-xs text-muted-foreground animate-pulse">
              Loading interactive demo...
            </div>
          </div>
        )}
        <iframe
          src={toolUrl}
          title={displayTitle}
          className="h-full w-full border-0 bg-transparent"
          onLoad={() => setIsLoading(false)}
          loading="lazy"
          allow="clipboard-write"
        />
      </div>
    </div>
  );
}
