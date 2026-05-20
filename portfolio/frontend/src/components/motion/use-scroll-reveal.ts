'use client';

import { useRef } from 'react';
import { useInView, useReducedMotion, type Target } from 'framer-motion';

export interface ScrollRevealOptions {
  y?: number;
  x?: number;
  margin?: string;
  amount?: number | 'some' | 'all';
  exitFactor?: number;
  exitOpacity?: number;
  firstMultiplier?: number;
}

export interface ScrollRevealReturn<T extends HTMLElement = HTMLElement> {
  ref: React.RefObject<T | null>;
  initial: Target;
  animate: Target;
  inView: boolean;
}

// Re-fires on every viewport entry. The very first reveal uses a bigger
// travel distance (firstMultiplier) so the first impression lands hard;
// subsequent reveals animate from the softer "subtle" exit state, giving
// a gentler — but still re-firing — entry on every later scroll.
//
// Leaving view (after the first reveal) animates back to the subtle state
// instead of snapping all the way back to hidden — controlled by
// exitFactor (how far it retreats) and exitOpacity (how much it fades).
export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  options: ScrollRevealOptions = {},
): ScrollRevealReturn<T> {
  const {
    y = 24,
    x = 0,
    margin = '-80px',
    amount = 'some',
    exitFactor = 0.9,
    exitOpacity = 0.05,
    firstMultiplier = 4,
  } = options;

  const prefersReduced = useReducedMotion();
  const ref = useRef<T>(null);
  const inView = useInView(ref, {
    margin: margin as `${number}px` | `${number}%`,
    amount,
  });
  const hasEntered = useRef(false);
  if (inView) hasEntered.current = true;

  const visible: Target = { opacity: 1, y: 0, x: 0 };
  const firstHidden: Target = {
    opacity: 0,
    y: y * firstMultiplier,
    x: x * firstMultiplier,
  };
  const subtle: Target = {
    opacity: exitOpacity,
    y: y * exitFactor,
    x: x * exitFactor,
  };

  if (prefersReduced) {
    return { ref, initial: visible, animate: visible, inView };
  }

  return {
    ref,
    initial: firstHidden,
    animate: inView ? visible : hasEntered.current ? subtle : firstHidden,
    inView,
  };
}
