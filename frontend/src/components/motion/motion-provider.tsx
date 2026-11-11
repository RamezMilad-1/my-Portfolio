'use client';

import { LazyMotion, MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

const loadFeatures = () => import('./motion-features').then((module) => module.default);

/**
 * Framer Motion's animation features load in a separate chunk after the page is interactive;
 * the `m.*` components render immediately in their resting state. `reducedMotion="user"` honours
 * the OS setting inside Framer itself, so the rendered markup never depends on it (branching on
 * it during render is what made hydration fail for visitors who prefer reduced motion).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
