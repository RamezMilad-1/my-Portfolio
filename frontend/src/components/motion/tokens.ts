/**
 * The site's motion language, shared by the Framer Motion components (CSS animations use the
 * matching `--ease-premium` variable in globals.css).
 */

/** Signature "premium" ease — decelerated, no overshoot. */
export const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
  /** Tab panels and other instant swaps. */
  instant: 0.15,
  /** Menus, lightbox open/close, caption swaps. */
  fast: 0.2,
  /** Tab panel entrance. */
  base: 0.35,
  /** Scroll reveals of small items. */
  moderate: 0.5,
  /** Scroll reveals of cards and large blocks. */
  slow: 0.6,
} as const;

/** Scroll-reveal travel distances in px: far enough to read as motion, never as an effect. */
export const DISTANCE = {
  sm: 8,
  md: 16,
  lg: 24,
} as const;

export const SPRING = {
  /** Nav and tab active-pill layout animation. */
  snappy: { type: 'spring', stiffness: 380, damping: 30 },
  /** Gallery slides. */
  smooth: { type: 'spring', stiffness: 240, damping: 32 },
} as const;

/** Per-item delay steps for staggered reveals. */
export const STAGGER = {
  tight: 0.04,
  base: 0.05,
  loose: 0.08,
  section: 0.1,
} as const;

/** Index-based delay, capped so the 30th grid tile doesn't wait a second for its turn. */
export function staggerDelay(index: number, step: number = STAGGER.base, max = 0.3): number {
  return Math.min(index * step, max);
}

export const TRANSITION = {
  fast: { duration: DURATION.fast, ease: EASE_PREMIUM },
  base: { duration: DURATION.base, ease: EASE_PREMIUM },
} as const;
