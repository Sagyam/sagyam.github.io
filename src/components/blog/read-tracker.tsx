'use client';

import { type ReactNode, useEffect, useRef } from 'react';

import { track } from '@/lib/analytics';

const DEPTHS = [25, 50, 75, 100];

function timeBucket(seconds: number) {
  // Under 10s is almost always someone who didn't mean to land here: a misclick or a bounce.
  if (seconds < 10) return '<10s';
  if (seconds < 30) return '10–30s';
  if (seconds < 120) return '30s–2m';
  if (seconds < 300) return '2–5m';
  if (seconds < 600) return '5–10m';
  return '10m+';
}

/*
 * Wraps a post and reports how it was read, each event at most once per page view:
 *   read-depth  { post, depth }  the bottom of the screen reached 25/50/75/100% of the post
 *   read-time   { post, seconds, bucket }  time the tab was visible, sent when the reader first
 *               leaves (switches tab, closes it, or navigates away). Coming back afterwards isn't
 *               counted, so long visits with a break in the middle read short.
 */
export function ReadTracker({ post, children }: { post: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reached = new Set<number>();
    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const progress = ((window.innerHeight - rect.top) / rect.height) * 100;
      for (const depth of DEPTHS) {
        // A sliver short of the end still counts as finishing; footers rarely scroll fully into view.
        if (reached.has(depth) || progress < (depth === 100 ? 98 : depth)) continue;
        reached.add(depth);
        track('read-depth', { post, depth });
      }
      if (reached.size === DEPTHS.length) window.removeEventListener('scroll', onScroll);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    measure();

    let visibleMs = 0;
    let visibleSince: number | null = document.visibilityState === 'visible' ? Date.now() : null;
    let sent = false;
    const report = () => {
      if (sent) return;
      sent = true;
      if (visibleSince !== null) visibleMs += Date.now() - visibleSince;
      const seconds = Math.round(visibleMs / 1000);
      track('read-time', { post, seconds, bucket: timeBucket(seconds) });
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') report();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', report);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', report);
      // Client-side navigation to another page unmounts the post without hiding the tab. Strict
      // Mode's rehearsal unmount leaves the element in the page, so it isn't mistaken for leaving.
      if (!el.isConnected) report();
    };
  }, [post]);

  return <div ref={ref}>{children}</div>;
}
