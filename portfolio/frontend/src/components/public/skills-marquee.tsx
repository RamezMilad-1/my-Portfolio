'use client';

import { motion, useReducedMotion } from 'framer-motion';

export function SkillsMarquee({ techs }: { techs: string[] }) {
  const prefersReduced = useReducedMotion();
  if (!techs.length) return null;
  const items = [...techs, ...techs, ...techs]; // triple for seamless loop

  return (
    <section className="relative overflow-hidden border-y border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 py-7">
      <div className="mask-edges-x">
        <motion.div
          animate={prefersReduced ? undefined : { x: ['0%', '-33.333%'] }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          className="flex w-max items-center gap-12 whitespace-nowrap"
        >
          {items.map((s, i) => (
            <span key={`${s}-${i}`} className="flex items-center gap-12">
              <span className="font-display text-2xl font-medium tracking-tight text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] md:text-3xl">
                {s}
              </span>
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]/40"
              />
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
