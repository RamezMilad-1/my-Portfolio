'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

/**
 * Custom cursor — single dot that smoothly follows the pointer, expanding
 * when it hovers over interactive elements (buttons, links, inputs).
 *
 * Auto-disables on touch devices and when prefers-reduced-motion is set.
 * The native cursor remains visible so this is purely additive.
 */
export function CustomCursor() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 500, damping: 50, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 50, mass: 0.4 });

  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    // Only enable on devices with a fine pointer (mouse/trackpad), not touch
    const mq = window.matchMedia('(pointer: fine)');
    setEnabled(mq.matches);
    const handler = () => setEnabled(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [prefersReduced]);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);

      // Detect interactive target by walking up looking for cursor:pointer
      const target = e.target as Element | null;
      if (target instanceof Element) {
        const interactive =
          target.closest('a, button, [role="button"], input, textarea, select, label, summary, [data-cursor="hover"]') !==
          null;
        setHovering(interactive);
      }
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => {
      setHovering(false);
      setPressed(false);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* Outer ring — slow follow, expands on hover */}
      <motion.div
        aria-hidden
        style={{
          x: sx,
          y: sy,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: hovering ? 56 : 28,
          height: hovering ? 56 : 28,
          borderColor: hovering
            ? 'hsl(var(--accent))'
            : 'hsl(var(--foreground) / 0.35)',
          opacity: pressed ? 0.6 : 1,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.3 }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden rounded-full border-[1.5px] mix-blend-difference md:block"
      />
      {/* Inner dot — instant follow, bright accent */}
      <motion.div
        aria-hidden
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: pressed ? 0.6 : hovering ? 0 : 1,
        }}
        transition={{ type: 'spring', stiffness: 600, damping: 40 }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))] mix-blend-difference md:block"
      />
    </>
  );
}
