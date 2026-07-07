'use client';

import { useEffect } from 'react';

/**
 * Marks <html> with `is-scrolling` while the user scrolls (cleared ~150ms
 * after the last scroll event). globals.css keys off it to pause the
 * paint-invalidating shimmer animations (animated gradient text).
 *
 * Those shimmers animate `background-position` under `background-clip: text`
 * — never compositor-driven, so every frame re-rasterizes the glyphs (and,
 * for `.ek-gradient-text`, a 60px blurred text-shadow). On a small section
 * heading that's cheap; on the viewport-wide project-detail headline it costs
 * several ms per frame, which is exactly the budget scrolling needs. Pausing
 * mid-scroll is invisible — the loops run 10–22s, so holding still for the
 * duration of a scroll doesn't read as a freeze — and lets the headline
 * scroll as an already-painted texture.
 *
 * Compositor-driven loops (`ek-bob`, `pulse-glow`) are deliberately NOT
 * paused: they cost the main thread nothing, and freezing a visibly bobbing
 * icon mid-scroll would be noticeable.
 */
export function ScrollPaintPause() {
  useEffect(() => {
    const root = document.documentElement;
    let timer: number | null = null;

    const onScroll = () => {
      if (timer === null) {
        root.classList.add('is-scrolling');
      } else {
        window.clearTimeout(timer);
      }
      timer = window.setTimeout(() => {
        root.classList.remove('is-scrolling');
        timer = null;
      }, 150);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (timer !== null) window.clearTimeout(timer);
      root.classList.remove('is-scrolling');
    };
  }, []);

  return null;
}
