'use client';

import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'violet' | 'emerald';

interface Props {
  label: string;
  icon?: React.ReactNode;
  tone?: Tone;
  className?: string;
  haloClassName?: string;
  pingClassName?: string;
  dotClassName?: string;
  labelClassName?: string;
  iconClassName?: string;
  borderGradient?: string;
}

const toneStyles: Record<
  Tone,
  {
    border: string;
    dot: string;
    dotPing: string;
    halo: string;
    icon: string;
    label: string;
  }
> = {
  violet: {
    border:
      'linear-gradient(90deg, hsl(var(--brand-indigo)), hsl(var(--brand-violet)))',
    dot: 'bg-[hsl(var(--brand-violet))]',
    dotPing: 'bg-[hsl(var(--brand-violet))]',
    halo: 'from-[hsl(var(--brand-indigo)/0.18)] to-[hsl(var(--brand-violet)/0.18)]',
    icon: 'text-[hsl(var(--brand-violet))]',
    label: 'ek-gradient-text-static',
  },
  emerald: {
    border:
      'linear-gradient(90deg, hsl(var(--brand-indigo)), hsl(var(--brand-emerald)))',
    dot: 'bg-[hsl(var(--brand-emerald))]',
    dotPing: 'bg-[hsl(var(--brand-emerald))]',
    halo: 'from-[hsl(var(--brand-indigo)/0.12)] to-[hsl(var(--brand-emerald)/0.20)]',
    icon: 'text-[hsl(var(--brand-emerald))]',
    label: 'text-[hsl(var(--brand-emerald-foreground))]',
  },
};

export function StatusBadge({
  label,
  icon,
  tone = 'violet',
  className,
  haloClassName,
  pingClassName,
  dotClassName,
  labelClassName,
  iconClassName,
  borderGradient,
}: Props) {
  const t = toneStyles[tone];
  return (
    <span
      className={cn(
        'relative inline-flex items-center gap-2 rounded-full border border-transparent px-3.5 py-1.5 text-xs font-medium',
        className,
      )}
      style={{
        background: `linear-gradient(hsl(var(--card)), hsl(var(--card))) padding-box, ${borderGradient ?? t.border} border-box`,
      }}
    >
      <span
        className={cn(
          `absolute inset-0 -z-10 rounded-full bg-gradient-to-r ${t.halo} blur-md`,
          haloClassName,
        )}
      />
      <span className="relative flex h-1.5 w-1.5 items-center justify-center">
        <span
          className={cn(
            `absolute h-1.5 w-1.5 animate-ping rounded-full ${t.dotPing} opacity-75`,
            pingClassName,
          )}
        />
        <span
          className={cn(
            `relative inline-block h-1.5 w-1.5 rounded-full ${t.dot}`,
            dotClassName,
          )}
        />
      </span>
      <span className={cn('font-semibold', t.label, labelClassName)}>
        {label}
      </span>
      {icon ?? (
        <Sparkles className={cn('h-3.5 w-3.5', t.icon, iconClassName)} />
      )}
    </span>
  );
}
