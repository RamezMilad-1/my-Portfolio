import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  kicker?: string;
  title?: string;
  subtitle?: string;
  centered?: boolean;
  /**
   * `line` — the kicker sits between two hairlines and there's no underline.
   * `classic` — the kicker is plain text above the title, with a gradient underline below.
   */
  variant?: 'line' | 'classic';
}

/** Section heading driven by content: renders nothing at all when every part is empty. */
export function SectionHeading({
  kicker,
  title,
  subtitle,
  centered = true,
  variant = 'line',
}: SectionHeadingProps) {
  const k = kicker?.trim();
  const t = title?.trim();
  const s = subtitle?.trim();
  if (!k && !t && !s) return null;

  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl text-left'}>
      {k && variant === 'line' ? (
        <Reveal
          variant="focus"
          y={8}
          className={cn('flex items-center gap-4', centered ? 'justify-center' : 'justify-start')}
        >
          <span
            aria-hidden
            className="reveal-line-start h-px w-14 bg-gradient-to-r from-transparent to-brand-violet/70 md:w-20"
          />
          <span className="font-display text-[11.5px] font-semibold uppercase tracking-[0.34em] text-[hsl(220_22%_76%)] md:text-[12.5px]">
            {k}
          </span>
          <span
            aria-hidden
            className="reveal-line-end h-px w-14 bg-gradient-to-r from-brand-violet/70 to-transparent md:w-20"
          />
        </Reveal>
      ) : null}
      {k && variant === 'classic' ? (
        <Reveal
          as="p"
          variant="focus"
          y={8}
          className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-violet-soft md:text-sm"
        >
          {k}
        </Reveal>
      ) : null}
      {t ? (
        <Reveal
          as="h2"
          variant="unveil"
          from={centered ? 'center' : 'left'}
          className="mt-3 font-display text-2xl font-bold tracking-tight md:text-3xl"
        >
          <span className="text-shimmer">{t}</span>
        </Reveal>
      ) : null}
      {s ? (
        <Reveal as="p" variant="focus" className="mt-3 text-sm text-muted-foreground md:text-base">
          {s}
        </Reveal>
      ) : null}
      {variant === 'classic' ? (
        <Reveal
          variant="draw"
          className={cn(
            'mt-5 h-px w-48 bg-gradient-to-r from-transparent via-brand-violet-soft to-transparent md:w-64',
            centered && 'mx-auto',
          )}
        />
      ) : null}
    </div>
  );
}
