'use client';

import { motion } from 'framer-motion';
import { useScrollReveal } from '../motion/use-scroll-reveal';

interface Props {
  kicker?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  id?: string;
}

const easing = [0.22, 1, 0.36, 1] as const;

export function SectionHeading({
  kicker,
  title,
  subtitle,
  centered = true,
  id,
}: Props) {
  const kickerReveal = useScrollReveal<HTMLParagraphElement>({ y: 8, margin: '-40px' });
  const titleReveal = useScrollReveal<HTMLHeadingElement>({ y: 16, margin: '-40px' });
  const subtitleReveal = useScrollReveal<HTMLParagraphElement>({ y: 16, margin: '-40px' });
  const dividerReveal = useScrollReveal<HTMLDivElement>({ y: 0, margin: '-40px' });

  return (
    <div
      id={id}
      className={
        centered
          ? 'mx-auto max-w-2xl text-center'
          : 'max-w-2xl text-left'
      }
    >
      {kicker ? (
        <motion.p
          ref={kickerReveal.ref}
          initial={kickerReveal.initial}
          animate={kickerReveal.animate}
          transition={{ duration: 0.5, ease: easing }}
          className="text-xs font-semibold uppercase tracking-[0.24em] text-[hsl(var(--brand-violet-soft))] md:text-sm"
        >
          {kicker}
        </motion.p>
      ) : null}
      <motion.h2
        ref={titleReveal.ref}
        initial={titleReveal.initial}
        animate={titleReveal.animate}
        transition={{ duration: 0.6, delay: 0.05, ease: easing }}
        className="font-display mt-3 text-2xl font-bold tracking-tight md:text-3xl"
      >
        <span className="ek-gradient-text">{title}</span>
      </motion.h2>
      {subtitle ? (
        <motion.p
          ref={subtitleReveal.ref}
          initial={subtitleReveal.initial}
          animate={subtitleReveal.animate}
          transition={{ duration: 0.6, delay: 0.12, ease: easing }}
          className="mt-3 text-sm text-[hsl(var(--muted-foreground))] md:text-base"
        >
          {subtitle}
        </motion.p>
      ) : null}
      <motion.div
        ref={dividerReveal.ref}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={
          dividerReveal.inView
            ? { opacity: 1, scaleX: 1 }
            : { opacity: 0.4, scaleX: 0.4 }
        }
        transition={{ duration: 0.6, delay: 0.2, ease: easing }}
        className={`mt-5 h-px bg-gradient-to-r from-transparent via-[hsl(var(--brand-violet-soft))] to-transparent ${
          centered ? 'mx-auto w-32' : 'w-32'
        }`}
      />
    </div>
  );
}
