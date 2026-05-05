'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  delay?: number;
  y?: number;
  once?: boolean;
}

/**
 * Fades + lifts a block as it scrolls into view.
 * Disables motion entirely if the user prefers reduced motion.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  once = true,
  className,
  ...rest
}: RevealProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <div className={className} {...(rest as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
