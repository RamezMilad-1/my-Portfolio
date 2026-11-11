import { Award, Briefcase, GraduationCap, type LucideIcon, Star } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import type { TimelineEntry, TimelineType } from '@/lib/types';
import { LifelineRail } from './lifeline-rail';

const TYPE_ICONS: Record<TimelineType, LucideIcon> = {
  education: GraduationCap,
  work: Briefcase,
  achievement: Award,
  personal: Star,
};

/**
 * Vertical timeline whose glowing rail draws itself as it scrolls through the viewport
 * (`LifelineRail`). Entries run oldest to newest, so the last one is marked "Latest".
 */
export function Lifeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <div className="relative mt-12">
      <LifelineRail />

      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-1 left-5 -translate-x-1/2 sm:left-6"
      >
        <span className="block h-3 w-3 rounded-full bg-brand-violet-soft opacity-60 blur-[6px]" />
      </span>

      <ol className="relative space-y-10 sm:space-y-12">
        {entries.map((entry, index) => {
          const Icon = TYPE_ICONS[entry.type] ?? GraduationCap;
          const isLatest = index === entries.length - 1;
          return (
            <li key={entry._id} className="group relative">
              <Reveal
                variant="pop"
                className="absolute left-5 top-3 z-[5] -translate-x-1/2 sm:left-6"
              >
                <span aria-hidden className="relative flex h-4 w-4 items-center justify-center">
                  <span
                    className={`absolute inset-0 -m-1.5 rounded-full bg-brand-violet blur-lg transition-opacity duration-500 ${
                      isLatest
                        ? 'animate-pulse-glow opacity-60'
                        : 'opacity-35 group-hover:opacity-55'
                    }`}
                  />
                  <span className="absolute inset-0 rounded-full bg-brand-violet opacity-45 blur-md" />
                  <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-indigo to-brand-violet text-white shadow-[0_0_14px_-1px_hsl(var(--brand-violet)/0.65)] ring-[3px] ring-[hsl(232_28%_10%)] transition-transform duration-500 group-hover:scale-110">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                </span>
              </Reveal>

              {/* The entry emerges from the rail, just after its dot (which sits further left,
                  so a batch plays the dot first). */}
              <Reveal x={-32} y={0} className="ml-12 sm:ml-16">
                <div className="flex items-start gap-3 sm:gap-5">
                  <div className="flex flex-shrink-0 flex-col items-start pt-0.5">
                    <span
                      className="text-brand-gradient whitespace-nowrap font-display text-lg font-bold tracking-tight sm:text-xl"
                      style={{ filter: 'drop-shadow(0 2px 12px hsl(var(--brand-violet) / 0.35))' }}
                    >
                      {entry.year}
                    </span>
                    {isLatest ? (
                      <span className="mt-1.5 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-brand-violet-soft">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inset-0 animate-ping rounded-full bg-brand-violet-soft opacity-70" />
                          <span className="relative h-1.5 w-1.5 rounded-full bg-brand-violet-soft" />
                        </span>
                        Latest
                      </span>
                    ) : null}
                  </div>

                  <div className="glass-card card-sheen glow-hover relative flex-1 overflow-hidden rounded-2xl p-4 transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-premium)] hover:-translate-y-0.5 sm:p-5">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -left-12 -top-12 h-28 w-28 rounded-full bg-brand-violet/18 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                    />
                    {entry.topic ? (
                      <div className="relative inline-flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-brand-indigo to-brand-violet shadow-[0_0_8px_hsl(var(--brand-violet)/0.6)]" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[hsl(220_20%_92%)]">
                          {entry.topic}
                        </p>
                      </div>
                    ) : null}
                    {entry.organization ? (
                      <p className="relative mt-2 text-[13px] font-semibold text-white">
                        {entry.organization}
                      </p>
                    ) : null}
                    <p
                      className={`${entry.topic || entry.organization ? 'mt-2.5' : ''} relative whitespace-pre-line text-[14.5px] leading-relaxed text-[hsl(220_25%_90%)]`}
                    >
                      {entry.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
