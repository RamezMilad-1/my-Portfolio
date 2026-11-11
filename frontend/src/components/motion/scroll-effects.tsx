'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const REVEAL_SELECTOR = '[data-reveal]:not([data-revealed])';
const SHIMMER_SELECTOR = '.text-shimmer, .hero-title';
const SCROLL_IDLE_MS = 150;

/** Elements whose tops are this close (px) count as one row when sequencing a batch. */
const ROW_TOLERANCE = 24;
/** A batch's sequence: at most this gap between neighbours, and this long from first to last. */
const STAGGER_STEP_MS = 90;
const STAGGER_SPAN_MS = 800;

/**
 * Starts the entrances of everything that just scrolled into view, in reading order: row by row,
 * left to right. Three cards play as a measured cascade, thirty icons as a quick wave.
 */
function revealInOrder(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
  const arriving = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => {
      const dy = a.boundingClientRect.top - b.boundingClientRect.top;
      return Math.abs(dy) < ROW_TOLERANCE
        ? a.boundingClientRect.left - b.boundingClientRect.left
        : dy;
    });
  const step =
    arriving.length > 1 ? Math.min(STAGGER_STEP_MS, STAGGER_SPAN_MS / (arriving.length - 1)) : 0;

  arriving.forEach((entry, index) => {
    const element = entry.target as HTMLElement;
    element.style.setProperty('--reveal-stagger', `${Math.round(index * step)}ms`);
    element.setAttribute('data-revealed', '');
    observer.unobserve(element);
  });
}

/**
 * One set of observers for the whole public site, instead of one per element:
 * - plays `[data-reveal]` entrances the first time elements scroll into view, sequencing
 *   whatever arrives together;
 * - pauses gradient-text shimmers while they're off screen (they repaint every frame);
 * - marks `<html>` with `is-scrolling` while the visitor scrolls, which pauses them mid-scroll.
 */
export function ScrollEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const reveals = new IntersectionObserver(revealInOrder, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.15,
    });
    const shimmers = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          (entry.target as HTMLElement).style.animationPlayState = entry.isIntersecting
            ? ''
            : 'paused';
        }
      },
      { rootMargin: '100px' },
    );

    const scan = () => {
      document.querySelectorAll(REVEAL_SELECTOR).forEach((element) => reveals.observe(element));
      document.querySelectorAll(SHIMMER_SELECTOR).forEach((element) => shimmers.observe(element));
    };
    scan();
    // Picks up content that mounts later, such as a newly opened tab panel.
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      reveals.disconnect();
      shimmers.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    let timer: number | undefined;
    const onScroll = () => {
      if (timer === undefined) root.classList.add('is-scrolling');
      else window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        root.classList.remove('is-scrolling');
        timer = undefined;
      }, SCROLL_IDLE_MS);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
      root.classList.remove('is-scrolling');
    };
  }, []);

  return null;
}
