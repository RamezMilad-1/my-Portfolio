'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectsPublic } from '@/lib/api/projects';
import { ProjectCard } from '@/components/public/project-card';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils';

export default function ProjectsPage() {
  const { data, isLoading } = useProjectsPublic();
  const [filter, setFilter] = useState<string | null>(null);

  const allTech = useMemo(() => {
    const counts = new Map<string, number>();
    (data ?? []).forEach((p) => p.tech.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t);
  }, [data]);

  const visible = useMemo(() => {
    const list = (data ?? []).slice().sort((a, b) => a.position - b.position);
    if (!filter) return list;
    return list.filter((p) => p.tech.includes(filter));
  }, [data, filter]);

  return (
    <div className="aurora relative overflow-hidden">
      <div className="noise pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
            Project showcase
          </p>
          <h1 className="font-display mt-2 text-5xl font-semibold tracking-tight md:text-7xl">
            Projects
          </h1>
          <p className="mt-4 max-w-2xl text-base text-[hsl(var(--muted-foreground))] md:text-lg">
            Each one is a real, deployable app — full-stack with description, architecture
            notes, media, team, and links to the live demo + source.
          </p>
        </Reveal>

        {allTech.length > 0 ? (
          <Reveal delay={0.05} className="mt-10">
            <div className="mask-edges-x flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
              <FilterChip active={filter === null} onClick={() => setFilter(null)}>
                All
              </FilterChip>
              {allTech.map((t) => (
                <FilterChip
                  key={t}
                  active={t === filter}
                  onClick={() => setFilter(t === filter ? null : t)}
                >
                  {t}
                </FilterChip>
              ))}
            </div>
          </Reveal>
        ) : null}

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] animate-pulse rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]"
              />
            ))
          ) : (
            <AnimatePresence mode="popLayout">
              {visible.length === 0 ? (
                <motion.p
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="col-span-full text-sm text-[hsl(var(--muted-foreground))]"
                >
                  No projects match this filter yet.
                </motion.p>
              ) : (
                visible.map((p, i) => (
                  <motion.div
                    key={p._id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.5, delay: i * 0.04 }}
                  >
                    <ProjectCard project={p} index={i} />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-4 py-1.5 text-xs transition-all',
        active
          ? 'border-transparent bg-[hsl(var(--foreground))] text-[hsl(var(--background))] shadow-md'
          : 'border-[hsl(var(--border))] bg-[hsl(var(--background))]/40 text-[hsl(var(--muted-foreground))] backdrop-blur hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]',
      )}
    >
      {children}
    </button>
  );
}
