import type { CSSProperties, ElementType, ReactNode } from 'react';
import { DISTANCE } from './tokens';

interface RevealProps {
  as?: ElementType;
  /** Horizontal entry offset in px (negative = from the left). */
  x?: number;
  /** Vertical entry offset in px (positive = from below). */
  y?: number;
  /** Starting scale, for elements that grow in. */
  scale?: number;
  /** Delay in seconds — use `staggerDelay()` for lists. */
  delay?: number;
  /** Duration in seconds. */
  duration?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Settles into place the first time it scrolls into view. Plain markup with CSS variables: the
 * shared observer in `ScrollEffects` flips it to revealed, and globals.css animates the change.
 * Wrap cards rather than putting this on elements that have their own hover transforms.
 */
export function Reveal({
  as: Component = 'div',
  x = 0,
  y = DISTANCE.md,
  scale,
  delay,
  duration,
  className,
  style,
  children,
}: RevealProps) {
  const vars: Record<string, string> = {};
  if (x !== 0) vars['--reveal-x'] = `${x}px`;
  if (y !== DISTANCE.md) vars['--reveal-y'] = `${y}px`;
  if (scale !== undefined) vars['--reveal-scale'] = String(scale);
  if (delay) vars['--reveal-delay'] = `${delay}s`;
  if (duration) vars['--reveal-duration'] = `${duration}s`;

  return (
    <Component data-reveal="" className={className} style={{ ...vars, ...style }}>
      {children}
    </Component>
  );
}
