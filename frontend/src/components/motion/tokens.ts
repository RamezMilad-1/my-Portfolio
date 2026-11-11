/**
 * Motion values for the Framer Motion components: the nav pill, tabs, gallery and lightbox.
 * Scroll and page-load entrances are pure CSS (globals.css, "Motion"), driven by `Reveal`,
 * `entranceSequence` and `ScrollEffects`.
 */

/** Signature "premium" ease — decelerated, no overshoot. Same as `--ease-premium` in CSS. */
export const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
  /** Tab panels and other instant swaps. */
  instant: 0.15,
  /** Menus, lightbox open/close, caption swaps. */
  fast: 0.2,
  /** Tab panel entrance. */
  base: 0.35,
} as const;

/** Travel distance in px for small UI transitions (tab panels). */
export const DISTANCE = {
  sm: 8,
} as const;

export const SPRING = {
  /** Nav and tab active-pill layout animation. */
  snappy: { type: 'spring', stiffness: 380, damping: 30 },
  /** Gallery slides. */
  smooth: { type: 'spring', stiffness: 240, damping: 32 },
} as const;

export const TRANSITION = {
  fast: { duration: DURATION.fast, ease: EASE_PREMIUM },
  base: { duration: DURATION.base, ease: EASE_PREMIUM },
} as const;
