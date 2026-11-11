import type { CSSProperties } from 'react';

/**
 * Delays for a page-load sequence (the `enter-*` classes in globals.css), handed out in rendered
 * order: each call returns the next element's style. CSS-only, so the sequence plays before
 * JavaScript loads.
 */
export function entranceSequence(start = 0.05, step = 0.11) {
  let index = 0;
  return (vars?: Record<string, string>): CSSProperties =>
    ({ '--enter-delay': `${(start + index++ * step).toFixed(2)}s`, ...vars }) as CSSProperties;
}
