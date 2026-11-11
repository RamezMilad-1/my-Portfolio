import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'violet' | 'emerald';

const TONES: Record<
  Tone,
  { border: string; dot: string; halo: string; icon: string; label: string }
> = {
  violet: {
    border: 'linear-gradient(90deg, hsl(var(--brand-indigo)), hsl(var(--brand-violet)))',
    dot: 'bg-brand-violet',
    halo: 'from-brand-indigo/18 to-brand-violet/18',
    icon: 'text-brand-violet',
    label: 'text-brand-gradient',
  },
  emerald: {
    border: 'linear-gradient(90deg, hsl(var(--brand-indigo)), hsl(var(--brand-emerald)))',
    dot: 'bg-brand-emerald',
    halo: 'from-brand-indigo/12 to-brand-emerald/20',
    icon: 'text-brand-emerald',
    label: 'text-brand-emerald-foreground',
  },
};

interface StatusBadgeProps {
  label: string;
  icon?: ReactNode;
  tone?: Tone;
  className?: string;
  haloClassName?: string;
  pingClassName?: string;
  dotClassName?: string;
  labelClassName?: string;
  iconClassName?: string;
  borderGradient?: string;
}

/** Pill with a pulsing status dot, e.g. "Open to internships". */
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
}: StatusBadgeProps) {
  const t = TONES[tone];
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
          'absolute inset-0 -z-10 rounded-full bg-gradient-to-r blur-md',
          t.halo,
          haloClassName,
        )}
      />
      <span className="relative flex h-1.5 w-1.5 items-center justify-center">
        <span
          className={cn(
            'absolute h-1.5 w-1.5 animate-ping rounded-full opacity-75',
            t.dot,
            pingClassName,
          )}
        />
        <span
          className={cn('relative inline-block h-1.5 w-1.5 rounded-full', t.dot, dotClassName)}
        />
      </span>
      <span className={cn('font-semibold', t.label, labelClassName)}>{label}</span>
      {icon ?? <Sparkles className={cn('h-3.5 w-3.5', t.icon, iconClassName)} />}
    </span>
  );
}
