'use client';

import { useEffect, useRef } from 'react';

/**
 * The rail draws while the timeline crosses the viewport: from when its top passes 85% of the
 * viewport height until its bottom passes 20%.
 */
const START = 0.85;
const END = 0.2;

/**
 * The timeline's rail: it draws itself and carries a glowing head as the visitor scrolls. Progress
 * goes to `--lifeline-progress` and globals.css turns it into transforms, so React never
 * re-renders. Works in every browser; with reduced motion (or before JavaScript) the rail is
 * simply drawn in full.
 */
export function LifelineRail() {
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, height } = rail.getBoundingClientRect();
      const viewport = window.innerHeight;
      const travelled = viewport * START - top;
      const distance = height + viewport * (START - END);
      const progress = Math.min(1, Math.max(0, travelled / distance));
      rail.style.setProperty('--lifeline-progress', progress.toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // Follow the scroll only while the timeline is on screen; on leaving, settle at 0 or 1.
    const visibility = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
      } else {
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
      }
      schedule();
    });
    visibility.observe(rail);

    return () => {
      visibility.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
      rail.style.removeProperty('--lifeline-progress');
    };
  }, []);

  return (
    <div
      ref={railRef}
      aria-hidden
      className="pointer-events-none absolute bottom-1 left-5 top-1 w-px sm:left-6"
    >
      <div className="absolute inset-0 w-px rounded-full bg-gradient-to-b from-white/[0.04] via-white/10 to-white/[0.04]" />
      <div className="lifeline-progress absolute inset-0 w-[1.5px] rounded-full bg-gradient-to-b from-brand-indigo/90 via-brand-violet/85 to-brand-violet-soft/70" />
      <div className="lifeline-head absolute inset-x-0 top-0 h-full">
        <span className="absolute left-1/2 top-0 block h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-violet-soft shadow-[0_0_18px_4px_hsl(var(--brand-violet)/0.6),0_0_32px_8px_hsl(var(--brand-violet)/0.25)]" />
      </div>
    </div>
  );
}
