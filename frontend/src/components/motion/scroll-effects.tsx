'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const REVEAL_SELECTOR = '[data-reveal]:not([data-revealed])';
const SHIMMER_SELECTOR = '.text-shimmer, .hero-title';
const SCROLL_IDLE_MS = 150;

/**
 * One set of observers for the whole public site, instead of one per element:
 * - reveals `[data-reveal]` elements the first time they scroll into view;
 * - pauses gradient-text shimmers while they're off screen (they repaint every frame);
 * - marks `<html>` with `is-scrolling` while the visitor scrolls, which pauses them mid-scroll.
 */
export function ScrollEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const reveals = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-revealed', '');
          reveals.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.15 },
    );
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
