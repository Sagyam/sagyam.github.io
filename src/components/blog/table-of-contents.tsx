'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = React.useState<TocItem[]>([]);
  const [activeId, setActiveId] = React.useState<string>('');
  const [isHovered, setIsHovered] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Extract headings from the article on mount and when DOM updates
  React.useEffect(() => {
    const extractHeadings = () => {
      const article = document.querySelector('article');
      if (!article) return;

      const headingElements = Array.from(article.querySelectorAll('h2, h3, h4')) as HTMLElement[];

      const items: TocItem[] = headingElements
        .map((el) => {
          const level = Number.parseInt(el.tagName.substring(1), 10);
          return {
            id: el.id,
            text: el.textContent || '',
            level,
          };
        })
        .filter((item) => Boolean(item.id && item.text.trim()));

      setHeadings(items);
      setActiveId((prev) => prev || (items.length > 0 ? items[0].id : ''));
    };

    extractHeadings();

    // Re-check headings if content loads asynchronously
    const timer = setTimeout(extractHeadings, 300);
    return () => clearTimeout(timer);
  }, []);

  // Track active heading on scroll
  React.useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;

      // If scrolled near the bottom, highlight the last heading
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
        setActiveId(headings[headings.length - 1].id);
        return;
      }

      // Find the heading closest to the top
      for (let i = headings.length - 1; i >= 0; i--) {
        const item = headings[i];
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= top) {
            setActiveId(item.id);
            return;
          }
        }
      }

      // Default to first heading if above all headings
      if (headings.length > 0) {
        setActiveId(headings[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headings]);

  const scrollToHeading = (id: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveId(id);
      window.history.pushState(null, '', `#${id}`);
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <aside
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Table of contents navigation"
      className="hidden lg:block fixed left-4 xl:left-[max(1.5rem,calc(50%-44rem))] top-28 z-40 select-none group"
    >
      {/* Collapsed State: Column of Dashes */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          isHovered
            ? 'opacity-0 pointer-events-none scale-95 absolute inset-0'
            : 'opacity-100 scale-100 flex flex-col items-start py-4 px-2'
        )}
      >
        <div className="flex flex-col gap-2 relative">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;
            // Width variations according to heading depth
            const dashWidth =
              heading.level === 2 ? 'w-7' : heading.level === 3 ? 'w-4 ml-1.5' : 'w-3 ml-3';

            return (
              <button
                type="button"
                key={heading.id}
                onClick={(e) => scrollToHeading(heading.id, e)}
                className="flex items-center h-4 cursor-pointer group/dash py-0.5 border-0 bg-transparent p-0 text-left"
                title={heading.text}
                aria-label={`Jump to ${heading.text}`}
              >
                {/* Active vertical indicator bar */}
                <div
                  className={cn(
                    'w-[2.5px] rounded-full transition-all duration-200 mr-1.5',
                    isActive
                      ? 'h-3.5 bg-foreground shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                      : 'h-0 bg-transparent'
                  )}
                />

                {/* Horizontal dash */}
                <div
                  className={cn(
                    'h-[2px] rounded-full transition-all duration-200',
                    dashWidth,
                    isActive
                      ? 'bg-foreground shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                      : 'bg-muted-foreground/35 group-hover/dash:bg-muted-foreground/75'
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded State: Full Table of Contents on Hover */}
      <div
        className={cn(
          'transition-all duration-300 ease-out origin-top-left',
          isHovered
            ? 'opacity-100 scale-100 pointer-events-auto translate-x-0'
            : 'opacity-0 scale-95 pointer-events-none -translate-x-2 absolute top-0 left-0'
        )}
      >
        <div className="w-72 max-w-[85vw] rounded-xl border border-border/80 bg-background/95 p-5 shadow-2xl backdrop-blur-md max-h-[calc(100vh-9rem)] flex flex-col">
          <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-4 flex items-center justify-between border-b border-border/40 pb-2">
            <span>ON THIS PAGE</span>
          </div>

          <nav
            aria-label="Table of contents list"
            className="flex-1 overflow-y-auto pr-2 space-y-1.5 custom-scrollbar text-sm"
          >
            {headings.map((heading) => {
              const isActive = activeId === heading.id;

              return (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  onClick={(e) => scrollToHeading(heading.id, e)}
                  className={cn(
                    'block transition-all duration-150 leading-snug py-1',
                    heading.level === 2 && 'font-medium text-sm',
                    heading.level === 3 && 'pl-3.5 text-[13px] font-normal',
                    heading.level >= 4 && 'pl-6 text-xs font-normal',
                    isActive
                      ? 'text-foreground font-semibold translate-x-0.5'
                      : 'text-muted-foreground hover:text-foreground hover:translate-x-0.5'
                  )}
                >
                  <span
                    className={cn('transition-colors', isActive ? 'text-primary' : 'text-inherit')}
                  >
                    {heading.text}
                  </span>
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
