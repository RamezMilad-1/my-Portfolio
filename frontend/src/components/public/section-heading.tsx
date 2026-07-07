'use client';

import { m } from 'framer-motion';
import { useScrollReveal } from '../motion/use-scroll-reveal';
import { usePausedOffscreen } from '../motion/use-paused-offscreen';
import {
  DISTANCE,
  DURATION,
  EASE_PREMIUM,
  TRANSITION,
  VIEWPORT,
} from '../motion/tokens';

interface Props {
  kicker?: string;
  title?: string;
  subtitle?: string;
  centered?: boolean;
  id?: string;
  /**
   * `line` (default) — kicker is wrapped in the `── KICKER ──` shape and no
   * underline appears below the title.
   * `classic` — kicker sits as plain text above the title, with a short
   * gradient underline below.
   */
  variant?: 'line' | 'classic';
}

export function SectionHeading({
  kicker,
  title,
  subtitle,
  centered = true,
  id,
  variant = 'line',
}: Props) {
  const kickerReveal = useScrollReveal<HTMLDivElement>({
    y: DISTANCE.sm,
    margin: VIEWPORT.chrome,
  });
  const titleReveal = useScrollReveal<HTMLHeadingElement>({
    y: DISTANCE.md,
    margin: VIEWPORT.chrome,
  });
  const subtitleReveal = useScrollReveal<HTMLParagraphElement>({
    y: DISTANCE.md,
    margin: VIEWPORT.chrome,
  });
  const dividerReveal = useScrollReveal<HTMLDivElement>({
    y: 0,
    margin: VIEWPORT.chrome,
  });
  // The title's gradient shimmer repaints its glyphs every frame; pause it
  // whenever this heading is offscreen.
  const shimmerRef = usePausedOffscreen<HTMLSpanElement>();

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
        variant === 'line' ? (
          <m.div
            ref={kickerReveal.ref}
            initial={kickerReveal.initial}
            animate={kickerReveal.animate}
            transition={TRANSITION.moderate}
            className={`flex items-center gap-4 ${
              centered ? 'justify-center' : 'justify-start'
            }`}
          >
            <span
              aria-hidden
              className="h-px w-14 bg-gradient-to-r from-transparent to-[hsl(var(--brand-violet)/0.7)] md:w-20"
            />
            <span className="font-display text-[11.5px] font-semibold uppercase tracking-[0.34em] text-[hsl(220_22%_76%)] md:text-[12.5px]">
              {kicker}
            </span>
            <span
              aria-hidden
              className="h-px w-14 bg-gradient-to-r from-[hsl(var(--brand-violet)/0.7)] to-transparent md:w-20"
            />
          </m.div>
        ) : (
          <m.p
            ref={kickerReveal.ref}
            initial={kickerReveal.initial}
            animate={kickerReveal.animate}
            transition={TRANSITION.moderate}
            className="text-xs font-semibold uppercase tracking-[0.24em] text-[hsl(var(--brand-violet-soft))] md:text-sm"
          >
            {kicker}
          </m.p>
        )
      ) : null}
      {title ? (
        <m.h2
          ref={titleReveal.ref}
          initial={titleReveal.initial}
          animate={titleReveal.animate}
          transition={{
            duration: DURATION.moderate,
            delay: 0.05,
            ease: EASE_PREMIUM,
          }}
          className="font-display mt-3 text-2xl font-bold tracking-tight md:text-3xl"
        >
          <span ref={shimmerRef} className="ek-gradient-text">
            {title}
          </span>
        </m.h2>
      ) : null}
      {subtitle ? (
        <m.p
          ref={subtitleReveal.ref}
          initial={subtitleReveal.initial}
          animate={subtitleReveal.animate}
          transition={{
            duration: DURATION.moderate,
            delay: 0.1,
            ease: EASE_PREMIUM,
          }}
          className="mt-3 text-sm text-[hsl(var(--muted-foreground))] md:text-base"
        >
          {subtitle}
        </m.p>
      ) : null}
      {variant === 'classic' ? (
        <m.div
          ref={dividerReveal.ref}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={
            dividerReveal.inView
              ? { opacity: 1, scaleX: 1 }
              : { opacity: 0, scaleX: 0 }
          }
          transition={{
            duration: DURATION.moderate,
            delay: 0.16,
            ease: EASE_PREMIUM,
          }}
          className={`mt-5 h-px bg-gradient-to-r from-transparent via-[hsl(var(--brand-violet-soft))] to-transparent ${
            centered ? 'mx-auto w-48 md:w-64' : 'w-48 md:w-64'
          }`}
        />
      ) : null}
    </div>
  );
}
