'use client';

import { m, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { DISTANCE, TRANSITION } from './tokens';

interface Props {
  children: ReactNode;
  /**
   * 'default' — public pages: soft rise + fade.
   * 'fast'    — dashboards/auth: quick opacity-only fade (tools should feel
   *             instant; only marketing surfaces get the lift).
   */
  variant?: 'default' | 'fast';
}

/**
 * Fades each route in on mount. We avoid AnimatePresence + mode="wait"
 * because, combined with Next.js client-side navigation, it can leave the
 * new route stuck in its initial (invisible) state when the old route
 * unmounts before exit completes.
 */
export function PageTransition({ children, variant = 'default' }: Props) {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();

  if (prefersReduced) return <>{children}</>;

  const fast = variant === 'fast';

  return (
    <m.div
      key={pathname}
      initial={{ opacity: 0, y: fast ? 0 : DISTANCE.sm }}
      animate={{ opacity: 1, y: 0 }}
      transition={fast ? TRANSITION.fast : TRANSITION.base}
    >
      {children}
    </m.div>
  );
}
