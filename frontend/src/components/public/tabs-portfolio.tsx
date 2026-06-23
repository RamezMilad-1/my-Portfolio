'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FolderKanban, Award, Cpu } from 'lucide-react';

type Tab = 'projects' | 'certificates' | 'tech';

interface Props {
  projects: React.ReactNode;
  certificates?: React.ReactNode;
  tech: React.ReactNode;
  counts?: { projects: number; certificates?: number; tech: number };
}

const ALL_TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'projects', label: 'Projects', icon: FolderKanban },
  { key: 'certificates', label: 'Certificates', icon: Award },
  { key: 'tech', label: 'Tech Stack', icon: Cpu },
];

export function TabsPortfolio({ projects, certificates, tech, counts }: Props) {
  const TABS = ALL_TABS.filter(
    (t) => t.key !== 'certificates' || certificates !== undefined,
  );
  const [active, setActive] = useState<Tab>('projects');

  const content =
    active === 'projects'
      ? projects
      : active === 'certificates'
        ? certificates
        : tech;

  return (
    <div>
      <div className="mb-10 flex justify-center">
        <div className="ek-glass inline-flex items-center gap-1 rounded-full p-1.5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = t.key === active;
            const count = counts?.[t.key];
            return (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className="relative rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-5 sm:py-2.5"
              >
                {isActive ? (
                  <motion.span
                    layoutId="portfolio-tab-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[hsl(var(--brand-indigo))] to-[hsl(var(--brand-violet))]"
                  />
                ) : null}
                <span
                  className={`relative z-10 inline-flex items-center gap-2 ${
                    isActive
                      ? 'text-white'
                      : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{t.label}</span>
                  {count !== undefined && count > 0 ? (
                    <span
                      className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                      }`}
                    >
                      {count}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
