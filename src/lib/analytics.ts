type EventData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: { track: (event: string, data?: EventData) => void };
  }
}

/*
 * The Umami script loads after hydration, so an event can be raised before `window.umami` exists.
 * Those wait here until it does. If it never arrives (blocked, or off the live domain), they're
 * dropped after a few seconds.
 */
const pending: [string, EventData | undefined][] = [];
let waiting = false;

function flush(attempt = 0) {
  if (window.umami) {
    for (const [event, data] of pending.splice(0)) window.umami.track(event, data);
    waiting = false;
  } else if (attempt < 20) {
    setTimeout(() => flush(attempt + 1), 500);
  } else {
    pending.length = 0;
    waiting = false;
  }
}

/** Send a custom event to Umami. Safe to call anywhere; does nothing on the server. */
export function track(event: string, data?: EventData) {
  if (typeof window === 'undefined') return;
  if (window.umami) {
    window.umami.track(event, data);
    return;
  }
  pending.push([event, data]);
  if (!waiting) {
    waiting = true;
    flush();
  }
}

/** The post a blog URL points at, e.g. `/blog/bloom-filter` → `bloom-filter`. */
export function postFromPath(pathname: string) {
  return pathname.split('/').filter(Boolean).pop() ?? '';
}
