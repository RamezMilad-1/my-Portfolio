'use client';

import { AnimatePresence, m } from 'framer-motion';
import { Cpu, FolderKanban, type LucideIcon } from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';
import { DISTANCE, DURATION, SPRING, TRANSITION } from '@/components/motion/tokens';

type TabKey = 'projects' | 'tech';

const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'projects', label: 'Projects', icon: FolderKanban },
  { key: 'tech', label: 'Tech Stack', icon: Cpu },
];

interface PortfolioTabsProps {
  projects: ReactNode;
  tech: ReactNode;
  counts: Record<TabKey, number>;
}

/** Projects / Tech Stack switcher. Both panels are server-rendered; this only toggles them. */
export function PortfolioTabs({ projects, tech, counts }: PortfolioTabsProps) {
  const [active, setActive] = useState<TabKey>('projects');
  const id = useId();

  return (
    <div>
      <div className="mb-10 flex justify-center">
        <div
          role="tablist"
          className="glass-card inline-flex items-center gap-1 rounded-full p-1.5"
        >
          {TABS.map(({ key, label, icon: Icon }) => {
            const selected = key === active;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                id={`${id}-${key}-tab`}
                aria-selected={selected}
                aria-controls={`${id}-${key}-panel`}
                onClick={() => setActive(key)}
                className="relative rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-5 sm:py-2.5"
              >
                {selected ? (
                  <m.span
                    layoutId="portfolio-tab-pill"
                    transition={SPRING.snappy}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-indigo to-brand-violet"
                  />
                ) : null}
                <span
                  className={`relative z-10 inline-flex items-center gap-2 ${
                    selected ? 'text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  {counts[key] > 0 ? (
                    <span
                      className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        selected ? 'bg-white/25 text-white' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {counts[key]}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={active}
          role="tabpanel"
          id={`${id}-${active}-panel`}
          aria-labelledby={`${id}-${active}-tab`}
          initial={{ opacity: 0, y: DISTANCE.sm }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: DURATION.instant, ease: 'easeOut' } }}
          transition={TRANSITION.base}
        >
          {active === 'projects' ? projects : tech}
        </m.div>
      </AnimatePresence>
    </div>
  );
}
