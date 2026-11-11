'use client';

import { useEffect, useRef } from 'react';

/**
 * The rail draws while the timeline crosses the viewport: from when its top passes 85% of the
 * viewport height until its bottom passes 20%.
 */
const START = 0.85;
const END = 0.2;

/** The head glides after the scroll on a soft, overdamped spring (no bounce). */
const STIFFNESS = 60;
const DAMPING = 20;
const MASS = 0.8;
/** Closer than this (and slower), the spring is at rest and the animation loop sleeps. */
const REST = 0.0005;

/**
 * The timeline's rail: it draws itself and carries a glowing head as the visitor scrolls. The
 * drawn length eases towards the scroll position on a spring, so it glides instead of stepping
 * with each scroll event (which lag a frame behind the browser's own scrolling, most visibly
 * on phones). Each frame only reads `scrollY` — the rail's geometry is measured when the page
 * changes size, never during scrolling — and writes `--lifeline-progress`, which globals.css
 * turns into transforms. With reduced motion (or before JavaScript) the rail is drawn in full.
 */
export function LifelineRail() {
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let railTop = 0;
    let railHeight = 0;
    let viewport = 0;
    const measure = () => {
      const rect = rail.getBoundingClientRect();
      railTop = rect.top + window.scrollY;
      railHeight = rect.height;
      viewport = document.documentElement.clientHeight;
    };
    const target = () => {
      const travelled = window.scrollY + viewport * START - railTop;
      const distance = railHeight + viewport * (START - END);
      return Math.min(1, Math.max(0, travelled / distance));
    };

    let position = 0;
    let velocity = 0;
    let frame = 0;
    let lastTime = 0;
    const render = () => rail.style.setProperty('--lifeline-progress', position.toFixed(4));

    const step = (now: number) => {
      // Capped so a backgrounded tab doesn't come back with one giant step.
      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;
      const goal = target();
      velocity += ((-STIFFNESS * (position - goal) - DAMPING * velocity) / MASS) * dt;
      position += velocity * dt;
      if (Math.abs(goal - position) < REST && Math.abs(velocity) < REST) {
        position = goal;
        velocity = 0;
        frame = 0;
      } else {
        frame = requestAnimationFrame(step);
      }
      render();
    };
    const wake = () => {
      if (frame || Math.abs(target() - position) < REST) return;
      lastTime = performance.now();
      frame = requestAnimationFrame(step);
    };
    const remeasure = () => {
      measure();
      wake();
    };

    // Start where the page already is (e.g. reloaded halfway down), without gliding in.
    measure();
    position = target();
    render();

    // Content above the timeline can change its position (images, "View all projects").
    const resize = new ResizeObserver(remeasure);
    resize.observe(document.body);
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', remeasure);

    return () => {
      resize.disconnect();
      window.removeEventListener('scroll', wake);
      window.removeEventListener('resize', remeasure);
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
