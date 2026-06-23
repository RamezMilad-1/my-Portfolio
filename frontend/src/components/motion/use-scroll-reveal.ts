'use client';

import { useRef } from 'react';
import { useInView, useReducedMotion, type Target } from 'framer-motion';

export interface ScrollRevealOptions {
  y?: number;
  x?: number;
  margin?: string;
  amount?: number | 'some' | 'all';
  // Re-fire on every viewport entry. Defaults to false (animate once and
  // stay): once a section has been seen, scrolling back doesn't replay it.
  // This is the Motion.dev / web.dev recommendation and prevents recruiter-
  // style scroll-backs from triggering animation cascades.
  once?: boolean;
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

export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  options: ScrollRevealOptions = {},
): ScrollRevealReturn<T> {
  const {
    y = 24,
    x = 0,
    margin = '-80px',
    amount = 0.15,
    once = true,
    exitFactor = 0.9,
    exitOpacity = 0.05,
    firstMultiplier = 4,
  } = options;

  const prefersReduced = useReducedMotion();
  const ref = useRef<T>(null);
  const inView = useInView(ref, {
    margin: margin as `${number}px` | `${number}%`,
    amount,
    once,
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

  // Once-only path (default): hold visible after first entry, no re-fire.
  if (once) {
    return {
      ref,
      initial: firstHidden,
      animate: hasEntered.current ? visible : firstHidden,
      inView,
    };
  }

  // Opt-in: subtle retreat on leave, gentler re-entry on subsequent views.
  return {
    ref,
    initial: firstHidden,
    animate: inView ? visible : hasEntered.current ? subtle : firstHidden,
    inView,
  };
}
