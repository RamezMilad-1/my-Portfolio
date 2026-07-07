'use client';

import { useRef } from 'react';
import { useInView, useReducedMotion, type Target } from 'framer-motion';
import { DISTANCE, VIEWPORT } from './tokens';

export interface ScrollRevealOptions {
  /** Vertical entry offset in px (positive = rises from below). */
  y?: number;
  /** Horizontal entry offset in px (negative = slides from the left). */
  x?: number;
  /** In-view root margin; use a VIEWPORT token. */
  margin?: string;
  amount?: number | 'some' | 'all';
}

export interface ScrollRevealReturn<T extends HTMLElement = HTMLElement> {
  ref: React.RefObject<T | null>;
  initial: Target;
  animate: Target;
  inView: boolean;
}

/**
 * Once-on-first-view reveal state. The hidden offset is exactly the distance
 * passed in (use DISTANCE tokens — 8/16/24px): reveals are meant to settle,
 * not travel. Once a section has been seen, scrolling back never replays it.
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  options: ScrollRevealOptions = {},
): ScrollRevealReturn<T> {
  const {
    y = DISTANCE.md,
    x = 0,
    margin = VIEWPORT.card,
    amount = 0.15,
  } = options;

  const prefersReduced = useReducedMotion();
  const ref = useRef<T>(null);
  const inView = useInView(ref, {
    margin: margin as `${number}px` | `${number}%`,
    amount,
    once: true,
  });

  const visible: Target = { opacity: 1, y: 0, x: 0 };

  if (prefersReduced) {
    return { ref, initial: visible, animate: visible, inView };
  }

  return {
    ref,
    initial: { opacity: 0, y, x },
    animate: inView ? visible : { opacity: 0, y, x },
    inView,
  };
}
