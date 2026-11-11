'use client';

import { type ReactNode, useEffect, useRef } from 'react';

/**
 * Height-aware sticky sidebar: it scrolls with the page until its bottom is 24px above the
 * viewport's bottom edge, then stays pinned there. The measured height is written straight to a
 * CSS variable, so resizing never re-renders React.
 */
export function StickyRail({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      element.style.setProperty('--rail-height', `${entry?.contentRect.height ?? 0}px`);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: 'sticky',
        top: 'max(24px, calc(100dvh - var(--rail-height, 0px) - 24px))',
      }}
    >
      {children}
    </div>
  );
}
