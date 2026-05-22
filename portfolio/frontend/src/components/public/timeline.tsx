'use client';

import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useScrollReveal } from '../motion/use-scroll-reveal';
import type { TimelineEntry } from '@/lib/types';

interface Props {
  entries: TimelineEntry[];
}

/**
 * Vertical "lifeline" — a glowing gradient rail that draws itself as the user
 * scrolls. A travelling head rides the leading edge of the rail, each entry
 * has a violet bullet, and the final entry is marked "Latest" to anchor the
 * timeline in the present.
 */
export function Timeline({ entries }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.85', 'end 0.2'],
  });
  const lineScale = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    mass: 0.8,
  });
  // Map 0..1 progress to a vertical % position for the travelling rail head.
  const headTop = useTransform(lineScale, (v) => `${Math.min(Math.max(v, 0), 1) * 100}%`);
  // Hide the head before the section enters view and after it leaves.
  const headOpacity = useTransform(lineScale, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);

  if (entries.length === 0) return null;

  return (
    <div ref={containerRef} className="relative mt-12">
      {/* Rail frame — defines the rail's vertical extent. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-1 left-5 top-1 w-px sm:left-6"
      >
        {/* Dim background rail (full height) */}
        <div className="absolute inset-0 w-px rounded-full bg-gradient-to-b from-white/[0.04] via-white/10 to-white/[0.04]" />

        {/* Foreground rail — purple gradient, grows with scroll */}
        <motion.div
          style={prefersReduced ? undefined : { scaleY: lineScale }}
          className="absolute inset-0 w-[1.5px] origin-top rounded-full bg-gradient-to-b from-[hsl(var(--brand-indigo)/0.9)] via-[hsl(var(--brand-violet)/0.85)] to-[hsl(var(--brand-violet-soft)/0.7)]"
        />

        {/* Travelling head — soft glowing dot at the leading edge of the rail */}
        {!prefersReduced ? (
          <motion.span
            aria-hidden
            style={{ top: headTop, opacity: headOpacity }}
            className="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(var(--brand-violet-soft))] shadow-[0_0_18px_4px_hsl(var(--brand-violet)/0.6),0_0_32px_8px_hsl(var(--brand-violet)/0.25)]"
          />
        ) : null}
      </div>

      {/* Bottom endcap glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-1 left-5 -translate-x-1/2 sm:left-6"
      >
        <span className="block h-3 w-3 rounded-full bg-[hsl(var(--brand-violet-soft))] opacity-60 blur-[6px]" />
      </span>

      <ul className="relative space-y-10 sm:space-y-12">
        {entries.map((entry, i) => (
          <TimelineRow
            key={entry._id}
            entry={entry}
            index={i}
            isLatest={i === entries.length - 1}
          />
        ))}
      </ul>
    </div>
  );
}

function TimelineRow({
  entry,
  index,
  isLatest,
}: {
  entry: TimelineEntry;
  index: number;
  isLatest: boolean;
}) {
  const reveal = useScrollReveal<HTMLLIElement>({
    x: 32,
    y: 18,
    margin: '-100px',
  });

  return (
    <motion.li
      ref={reveal.ref}
      initial={reveal.initial}
      animate={reveal.animate}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.05,
      }}
      className="group relative"
    >
      {/* Bullet on the rail. Rides the parent row's reveal stagger via the
          shared `reveal.inView` state — no per-bullet spring on each entry,
          which keeps long timelines from spawning N parallel framer-motion
          animations as the viewport scrolls. */}
      <motion.span
        aria-hidden
        initial={{ scale: 0, opacity: 0 }}
        animate={reveal.inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 + 0.1 }}
        className="absolute left-5 top-3 z-[5] -translate-x-1/2 sm:left-6"
      >
        <span className="relative flex h-4 w-4 items-center justify-center">
          {/* Outer halo — stronger and pulsing for the latest entry */}
          <span
            className={`absolute inset-0 -m-1.5 rounded-full bg-[hsl(var(--brand-violet))] blur-lg transition-opacity duration-500 ${
              isLatest
                ? 'animate-pulse-glow opacity-60'
                : 'opacity-35 group-hover:opacity-55'
            }`}
          />
          {/* Inner violet glow */}
          <span className="absolute inset-0 rounded-full bg-[hsl(var(--brand-violet))] opacity-45 blur-md" />
          {/* Solid dot */}
          <span className="relative h-3 w-3 rounded-full bg-gradient-to-br from-[hsl(var(--brand-indigo))] to-[hsl(var(--brand-violet))] ring-[3px] ring-[hsl(232_28%_10%)] shadow-[0_0_14px_-1px_hsl(var(--brand-violet)/0.65)] transition-transform duration-500 group-hover:scale-110" />
        </span>
      </motion.span>

      {/* Year column + card */}
      <div className="flex items-start gap-3 pl-12 sm:gap-5 sm:pl-16">
        <div className="flex flex-shrink-0 flex-col items-start pt-0.5">
          <span
            className="ek-gradient-text-static font-display whitespace-nowrap text-lg font-bold tracking-tight sm:text-xl"
            style={{
              filter:
                'drop-shadow(0 2px 12px hsl(var(--brand-violet) / 0.35))',
            }}
          >
            {entry.year}
          </span>
          {isLatest ? (
            <span className="mt-1.5 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-[hsl(var(--brand-violet-soft))]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-[hsl(var(--brand-violet-soft))] opacity-70" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-violet-soft))]" />
              </span>
              Latest
            </span>
          ) : null}
        </div>

        <div className="ek-glass ek-card-sheen ek-glow relative flex-1 overflow-hidden rounded-2xl p-4 transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 sm:p-5">
          {/* Subtle corner glow on hover */}
          <div
            aria-hidden
            style={{ willChange: 'opacity' }}
            className="pointer-events-none absolute -left-12 -top-12 h-28 w-28 rounded-full bg-[hsl(var(--brand-violet)/0.18)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
          />

          {entry.topic ? (
            <div className="relative inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[hsl(var(--brand-indigo))] to-[hsl(var(--brand-violet))] shadow-[0_0_8px_hsl(var(--brand-violet)/0.6)]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[hsl(220_20%_92%)]">
                {entry.topic}
              </p>
            </div>
          ) : null}
          <p
            className={`${
              entry.topic ? 'mt-2.5' : ''
            } relative whitespace-pre-line text-[14.5px] leading-relaxed text-[hsl(220_25%_90%)]`}
          >
            {entry.body}
          </p>
        </div>
      </div>
    </motion.li>
  );
}
