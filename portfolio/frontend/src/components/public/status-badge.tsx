'use client';

import { Sparkles } from 'lucide-react';

type Tone = 'violet' | 'emerald';

interface Props {
  label: string;
  icon?: React.ReactNode;
  tone?: Tone;
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

export function StatusBadge({ label, icon, tone = 'violet' }: Props) {
  const t = toneStyles[tone];
  return (
    <span
      className="relative inline-flex items-center gap-2 rounded-full border border-transparent px-3.5 py-1.5 text-xs font-medium"
      style={{
        background: `linear-gradient(hsl(var(--card)), hsl(var(--card))) padding-box, ${t.border} border-box`,
      }}
    >
      <span
        className={`absolute inset-0 -z-10 rounded-full bg-gradient-to-r ${t.halo} blur-md`}
      />
      <span className="relative flex h-1.5 w-1.5 items-center justify-center">
        <span
          className={`absolute h-1.5 w-1.5 animate-ping rounded-full ${t.dotPing} opacity-75`}
        />
        <span
          className={`relative inline-block h-1.5 w-1.5 rounded-full ${t.dot}`}
        />
      </span>
      <span className={`font-semibold ${t.label}`}>{label}</span>
      {icon ?? <Sparkles className={`h-3.5 w-3.5 ${t.icon}`} />}
    </span>
  );
}
