'use client';

import { RotateCcw } from 'lucide-react';
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

const VisibleContext = createContext(true);

/** True while the demo is on screen. Simulations pause when it turns false. */
export function useDemoVisible() {
  return useContext(VisibleContext);
}

interface DemoProps {
  title: string;
  onReset?: () => void;
  caption?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** The frame every interactive figure in a post sits in. */
export function Demo({ title, onReset, caption, children, className }: DemoProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: '120px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <figure
      ref={ref}
      className={cn(
        'not-prose my-10 overflow-hidden rounded-xl border border-edge/10 bg-card shadow-sm',
        className
      )}
    >
      <header className="flex h-11 items-center justify-between gap-3 border-b border-edge/10 px-4">
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className="size-1.5 rounded-full bg-amber" aria-hidden="true" />
          Try it · {title}
        </span>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-edge/5 hover:text-foreground"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Reset
          </button>
        )}
      </header>
      <div className="space-y-5 p-4 sm:p-5">
        <VisibleContext.Provider value={visible}>{children}</VisibleContext.Provider>
      </div>
      {caption && (
        <figcaption className="border-t border-edge/10 bg-edge/[0.02] px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
