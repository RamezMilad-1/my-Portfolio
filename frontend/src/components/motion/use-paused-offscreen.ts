'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Pauses CSS animations on an element while it is outside the viewport.
 *
 * The animated-gradient text effects (`ek-hero-title`, `ek-gradient-text`)
 * animate `background-position` on `background-clip: text`, which repaints
 * the glyphs every frame for as long as the element exists — including while
 * it's scrolled far offscreen. Pausing offscreen is visually free (the
 * gradient simply holds its current position) and removes that steady paint
 * tax from every scroll below the fold.
 *
 * Returns a CALLBACK ref, not a ref object: the shimmer spans typically
 * mount only after their content arrives from the API (`{title ? <span …>}`),
 * so a mount-time effect would observe `null` and never re-attach. The
 * callback re-runs whenever the element actually appears or is replaced.
 *
 * Writes `animationPlayState` directly on the DOM node — no React state, so
 * visibility flips never cause a re-render.
 */
export function usePausedOffscreen<T extends HTMLElement = HTMLElement>() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const refCallback = useCallback((el: T | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // In view: clear the inline value (stylesheet default is `running`)
        // instead of writing `running`. An inline value would out-specify
        // the `html.is-scrolling … { animation-play-state: paused }` rule,
        // which needs to win while the user is scrolling.
        el.style.animationPlayState = entry.isIntersecting ? '' : 'paused';
      },
      // Generous margin: resume slightly before entry so the shimmer is
      // already moving when the element becomes visible.
      { rootMargin: '100px' },
    );
    observer.observe(el);
    observerRef.current = observer;
  }, []);

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  return refCallback;
}
