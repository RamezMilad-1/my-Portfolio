'use client';

import { LazyMotion, domMax } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * App-wide LazyMotion boundary. Every animated component uses the slim `m.*`
 * factories, so the initial bundle ships only framer-motion's core; the
 * feature set loads once here. `domMax` (not `domAnimation`) because the nav
 * and portfolio tabs use `layoutId` pills, which need layout projection.
 * `strict` turns any accidental full `motion.*` import into a loud dev error
 * instead of a silent bundle regression.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      {children}
    </LazyMotion>
  );
}
