'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { useScrollReveal, type ScrollRevealOptions } from './use-scroll-reveal';

interface RevealProps
  extends Omit<HTMLMotionProps<'div'>, 'children'>,
    ScrollRevealOptions {
  children: ReactNode;
  delay?: number;
  duration?: number;
}

// Re-fires on every entry, with a softer reverse animation on exit. See
// useScrollReveal for the underlying behavior.
export function Reveal({
  children,
  delay = 0,
  duration = 0.7,
  y,
  x,
  margin,
  amount,
  exitFactor,
  exitOpacity,
  className,
  ...rest
}: RevealProps) {
  const { ref, initial, animate } = useScrollReveal<HTMLDivElement>({
    y,
    x,
    margin,
    amount,
    exitFactor,
    exitOpacity,
  });

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{ duration, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
