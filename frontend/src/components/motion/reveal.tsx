'use client';

import { m } from 'framer-motion';
import { useScrollReveal } from './use-scroll-reveal';
import { DURATION, EASE_PREMIUM, VIEWPORT } from './tokens';

interface Props {
  /** Horizontal entry offset (negative = from the left). Use DISTANCE tokens. */
  x?: number;
  /** Vertical entry offset (positive = from below). Use DISTANCE tokens. */
  y?: number;
  /** Stagger delay in seconds (cap with staggerDelay for lists). */
  delay?: number;
  /** Root margin for the in-view trigger; use a VIEWPORT token. */
  margin?: string;
  /** Reveal duration; defaults to the card/block duration. */
  duration?: number;
  className?: string;
  children: React.ReactNode;
}

/**
 * Thin wrapper over `useScrollReveal` (once-on-first-view) for adding an
 * additive entrance animation around any block without changing its resting
 * layout. Pulls duration/ease from the motion tokens so it always reads as a
 * peer of every other reveal on the site.
 */
export function Reveal({
  x = 0,
  y = 0,
  delay = 0,
  margin = VIEWPORT.card,
  duration = DURATION.slow,
  className,
  children,
}: Props) {
  const { ref, initial, animate } = useScrollReveal<HTMLDivElement>({
    x,
    y,
    margin,
  });

  return (
    <m.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{ duration, ease: EASE_PREMIUM, delay }}
      className={className}
    >
      {children}
    </m.div>
  );
}
