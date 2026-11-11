import type { CSSProperties, ElementType, ReactNode } from 'react';

/**
 * How an element arrives (globals.css, "Motion"):
 * - `rise` — fades up; `x`/`y` change the direction.
 * - `focus` — rises while sharpening from a blur. For text.
 * - `land` — tips forward onto the page from slightly below. For cards.
 * - `pop` — scales up with a small overshoot. For icons and dots.
 * - `unveil` — uncovered by a widening window (`from`). For titles and the portrait.
 * - `draw` — a line drawing itself from its transform origin.
 * - `group` — no motion of its own; its `.reveal-stagger` children come in one by one.
 */
export type RevealVariant = 'rise' | 'focus' | 'land' | 'pop' | 'unveil' | 'draw' | 'group';

/** Where an `unveil` window opens from. */
const UNVEIL_FROM = {
  center: 'inset(0 50% 0 50%)',
  left: 'inset(0 100% 0 0)',
  bottom: 'inset(100% 0 0 0 round 1.5rem)',
} as const;

interface RevealProps {
  as?: ElementType;
  variant?: RevealVariant;
  /** Horizontal entry offset in px (negative = from the left). */
  x?: number;
  /** Vertical entry offset in px (positive = from below). */
  y?: number;
  /** For `unveil`: the edge the window opens from. */
  from?: keyof typeof UNVEIL_FROM;
  /** For purely decorative reveals. */
  'aria-hidden'?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Plays its entrance the first time it scrolls into view. Plain markup: the shared observer in
 * `ScrollEffects` marks it revealed, and when several elements arrive together it sequences them
 * in reading order — so lists and grids need no hand-tuned delays.
 */
export function Reveal({
  as: Component = 'div',
  variant = 'rise',
  x,
  y,
  from,
  'aria-hidden': ariaHidden,
  className,
  style,
  children,
}: RevealProps) {
  const vars: Record<string, string> = {};
  if (x !== undefined) vars['--reveal-x'] = `${x}px`;
  if (y !== undefined) vars['--reveal-y'] = `${y}px`;
  if (from) vars['--reveal-clip'] = UNVEIL_FROM[from];

  return (
    <Component
      data-reveal={variant}
      aria-hidden={ariaHidden}
      className={className}
      style={{ ...vars, ...style }}
    >
      {children}
    </Component>
  );
}
