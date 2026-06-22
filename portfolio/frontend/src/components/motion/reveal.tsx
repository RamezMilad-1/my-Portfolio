'use client';

import { motion } from 'framer-motion';
import { useScrollReveal } from './use-scroll-reveal';

interface Props {
  /** Horizontal entry offset (negative = from the left). */
  x?: number;
  /** Vertical entry offset (positive = from below). */
  y?: number;
  /** Stagger delay in seconds. */
  delay?: number;
  /** Root margin for the in-view trigger, e.g. "-60px". */
  margin?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Thin wrapper over `useScrollReveal` (once-on-first-view) for adding an
 * additive entrance animation around any block without changing its resting
 * layout. Matches the site's shared easing/duration so it reads as a peer of
 * the existing reveals.
 */
export function Reveal({
  x = 0,
  y = 0,
  delay = 0,
  margin = '-80px',
  className,
  children,
}: Props) {
  const { ref, initial, animate } = useScrollReveal<HTMLDivElement>({
    x,
    y,
    margin,
  });

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
