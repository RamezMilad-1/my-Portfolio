'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, ExternalLink, Github } from 'lucide-react';
import { useScrollReveal } from '../motion/use-scroll-reveal';
import { uploadsUrl } from '@/lib/utils';
import type { Project } from '@/lib/types';

interface Props {
  project: Project;
  index?: number;
}

export function ProjectCardV2({ project, index = 0 }: Props) {
  const { ref, initial, animate } = useScrollReveal<HTMLDivElement>({
    y: 32,
    margin: '-60px',
  });

  const cover =
    project.coverImageUrl
      ? uploadsUrl(project.coverImageUrl)
      : project.media?.find((m) => m.kind === 'image')?.url
        ? uploadsUrl(project.media.find((m) => m.kind === 'image')!.url)
        : null;

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
      className="group ek-glass relative overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-1 ek-glow"
    >
      <Link
        href={`/projects/${project.slug}`}
        aria-label={`Open ${project.name}`}
        className="absolute inset-0 z-[1]"
      >
        <span className="sr-only">Open {project.name}</span>
      </Link>

      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[hsl(var(--brand-indigo)/0.16)] to-[hsl(var(--brand-violet-soft)/0.16)]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={project.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-5xl font-bold tracking-tight text-white/30">
              {project.name
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0])
                .join('')
                .toUpperCase()}
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90" />

        <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-transform duration-300 group-hover:scale-110">
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>

        {project.category ? (
          <div className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
            {project.category}
          </div>
        ) : null}
      </div>

      <div className="relative p-4">
        <h3 className="font-display line-clamp-1 text-lg font-semibold tracking-tight">
          {project.name}
        </h3>
        {project.tagline ? (
          <p className="mt-1.5 line-clamp-2 text-[13px] text-[hsl(var(--muted-foreground))]">
            {project.tagline}
          </p>
        ) : null}

        {project.tech?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tech.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-full border border-[hsl(var(--brand-violet-soft)/0.22)] bg-[hsl(var(--brand-violet-soft)/0.06)] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--brand-indigo))]"
              >
                {t}
              </span>
            ))}
            {project.tech.length > 4 ? (
              <span className="rounded-full border border-[hsl(var(--border))] px-2 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
                +{project.tech.length - 4}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="relative z-[2] mt-4 flex items-center justify-between border-t border-[hsl(var(--border))] pt-3">
          <div className="flex items-center gap-2">
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={stopPropagation}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--brand-indigo))] transition-colors hover:text-[hsl(var(--foreground))]"
              >
                {project.liveLabel ?? 'Live Demo'}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={stopPropagation}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
              >
                {project.sourceLabel ?? 'Source'}
                <Github className="h-3 w-3" />
              </a>
            ) : null}
          </div>
          <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] transition-colors group-hover:text-[hsl(var(--brand-indigo))]">
            Details →
          </span>
        </div>
      </div>
    </motion.div>
  );
}
