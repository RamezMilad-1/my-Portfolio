/**
 * Single source of truth for the site's motion language. Every reveal, hover,
 * and transition should pull from here instead of re-typing a duration/easing
 * — that's what kept e.g. the nav mobile menu (0.2s, no easing) and the tab
 * switch (0.3s, no easing) drifting from the rest of the site's signature
 * curve. Consolidating here also means a single future tweak (e.g. "make
 * reveals 10% snappier") propagates everywhere at once.
 */

/** The site's signature "premium" ease — decelerated, no overshoot. */
export const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

/** Same curve as a CSS string, for inline styles / CSS-in-JS boundaries. */
export const EASE_PREMIUM_CSS = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const DURATION = {
  /** Button presses, tab pills, tap feedback. */
  instant: 0.15,
  /** Menus, lightbox open/close, tooltip-scale content swaps. */
  fast: 0.2,
  /** Page transition, small reveal items (list rows, chips). */
  base: 0.35,
  /** Standard scroll-reveal for section chrome (kicker/subtitle/divider). */
  moderate: 0.5,
  /** Card + large-block scroll reveals. */
  slow: 0.6,
  /** Hero headline / biggest single-element entrance. */
  slower: 0.8,
} as const;

/**
 * Scroll-reveal travel distances, in px. Reveals move a short distance with
 * a decelerated ease — far enough to read as motion, never far enough to
 * read as an effect. (The old system multiplied per-call offsets ×4, which
 * had cards flying in from 128–224px; that's the "heavy" look this replaces.)
 */
export const DISTANCE = {
  /** Kickers, dividers, list rows, chips. */
  sm: 8,
  /** Titles, paragraphs, grid tiles. */
  md: 16,
  /** Cards and large blocks (also the cap for directional x-slides). */
  lg: 24,
} as const;

/** In-view root margins: how far inside the viewport a reveal triggers. */
export const VIEWPORT = {
  /** Text & section chrome — trigger early so copy never appears late. */
  chrome: '-40px',
  /** Cards & big blocks — slightly deeper so the motion is seen. */
  card: '-60px',
} as const;

export const SPRING = {
  /** Nav / tab active-pill layout animation — snappy, no bounce. */
  snappy: { type: 'spring', stiffness: 380, damping: 30 } as const,
  /** Directional slide content (gallery main image). */
  smooth: { type: 'spring', stiffness: 240, damping: 32 } as const,
  /** Small hover lifts (thumbnails). */
  lift: { type: 'spring', stiffness: 320, damping: 24 } as const,
  /** Scroll-linked progress (timeline rail) — slow to settle, no jitter. */
  gentle: { type: 'spring', stiffness: 60, damping: 20, mass: 0.8 } as const,
};

/** Per-item delay step for staggered list/grid reveals. */
export const STAGGER = {
  tight: 0.04,
  base: 0.05,
  loose: 0.08,
  /** Hero / section-level container stagger (variants `staggerChildren`). */
  section: 0.1,
} as const;

/**
 * Capped index stagger. Index-based delays must never grow unbounded — the
 * 30th grid tile entering the viewport should not sit invisible for 1.2s
 * "waiting its turn". Past the cap, items simply animate together, which
 * reads as one settled wave instead of a queue.
 */
export function staggerDelay(
  index: number,
  step: number = STAGGER.base,
  max = 0.3,
): number {
  return Math.min(index * step, max);
}

/** Shared transition presets — spread directly into a `transition` prop. */
export const TRANSITION = {
  fast: { duration: DURATION.fast, ease: EASE_PREMIUM },
  base: { duration: DURATION.base, ease: EASE_PREMIUM },
  moderate: { duration: DURATION.moderate, ease: EASE_PREMIUM },
  slow: { duration: DURATION.slow, ease: EASE_PREMIUM },
  slower: { duration: DURATION.slower, ease: EASE_PREMIUM },
} as const;
