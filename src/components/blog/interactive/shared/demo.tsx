'use client';

import { RotateCcw } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  createContext,
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { postFromPath, track } from '@/lib/analytics';
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

  useDemoAnalytics(ref, title);

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

/*
 * Two events per demo, each sent at most once per page view:
 *   demo-view  half of it (or half a screen of it, for tall ones) came on screen
 *   demo-use   the reader clicked, dragged, typed or picked something inside it
 * demo-use ÷ demo-view is the share of readers who actually tried it.
 */
function useDemoAnalytics(ref: RefObject<HTMLElement | null>, title: string) {
  const post = postFromPath(usePathname());

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const data = { demo: title, post };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const seen =
          entry.intersectionRatio >= 0.5 ||
          entry.intersectionRect.height >= window.innerHeight * 0.5;
        if (!seen) return;
        track('demo-view', data);
        observer.disconnect();
      },
      { threshold: Array.from({ length: 11 }, (_, i) => i / 10) }
    );
    observer.observe(el);

    // `click` rather than `pointerdown`, so a finger that lands on the demo while scrolling the
    // page doesn't count. Sliders report through `input`; Tab only moves focus, so it's ignored.
    const used = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key === 'Tab') return;
      track('demo-use', data);
      stop();
    };
    const kinds = ['click', 'input', 'change', 'keydown'] as const;
    const stop = () => kinds.forEach((kind) => el.removeEventListener(kind, used, true));
    kinds.forEach((kind) => el.addEventListener(kind, used, true));

    return () => {
      observer.disconnect();
      stop();
    };
  }, [ref, title, post]);
}
