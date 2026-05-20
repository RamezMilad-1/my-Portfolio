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
      className="group ek-glass ek-card-sheen ek-ring-conic ek-glow relative overflow-hidden rounded-xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5"
    >
      <Link
        href={`/projects/${project.slug}`}
        aria-label={`Open ${project.name}`}
        className="absolute inset-0 z-[1]"
      >
        <span className="sr-only">Open {project.name}</span>
      </Link>

      <div className="relative aspect-[16/9] overflow-hidden bg-[linear-gradient(135deg,hsl(244_30%_18%/0.85)_0%,hsl(225_30%_12%/0.85)_60%,hsl(275_35%_20%/0.85)_100%)]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={project.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_40%,hsl(0_0%_100%/0.10),transparent_70%)]"
            />
            <span className="font-display relative text-5xl font-bold tracking-tight text-[hsl(220_25%_88%)]/85">
              {project.name
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0])
                .join('')
                .toUpperCase()}
            </span>
          </div>
        )}

        {/* Bottom darkening for legibility — softer */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[hsl(220_40%_4%/0.60)] via-[hsl(220_40%_4%/0.05)] to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />

        <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[hsl(220_30%_8%/0.55)] text-white backdrop-blur-md shadow-[0_6px_18px_-8px_hsl(220_40%_4%/0.6)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-white/30 group-hover:bg-[hsl(220_30%_14%/0.75)]">
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>

        {project.category ? (
          <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-[hsl(220_30%_8%/0.55)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(220_25%_92%)] backdrop-blur-md">
            {project.category}
          </div>
        ) : null}
      </div>

      <div className="relative p-3.5">
        <h3 className="font-display line-clamp-1 text-[15px] font-semibold tracking-tight text-[hsl(220_25%_94%)] transition-colors duration-300 group-hover:text-white">
          {project.name}
        </h3>
        {project.tagline ? (
          <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-[hsl(220_15%_72%)]">
            {project.tagline}
          </p>
        ) : null}

        {project.tech?.length ? (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {project.tech.slice(0, 4).map((t) => (
              <span key={t} className="ek-tag">
                {t}
              </span>
            ))}
            {project.tech.length > 4 ? (
              <span className="ek-tag-muted">+{project.tech.length - 4}</span>
            ) : null}
          </div>
        ) : null}

        <div className="relative z-[2] mt-3 flex items-center justify-between border-t border-white/10 pt-2.5">
          <div className="flex items-center gap-3">
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={stopPropagation}
                className="group/link inline-flex items-center gap-1 text-xs font-semibold transition-opacity duration-200 hover:opacity-90"
              >
                <span className="bg-gradient-to-r from-[hsl(var(--brand-indigo))] to-[hsl(var(--brand-violet))] bg-clip-text text-transparent">
                  {project.liveLabel ?? 'Live Demo'}
                </span>
                <ExternalLink className="h-3 w-3 text-[hsl(var(--brand-violet))] transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
              </a>
            ) : null}
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={stopPropagation}
                className="group/link inline-flex items-center gap-1 text-xs font-semibold text-[hsl(220_15%_70%)] transition-colors duration-200 hover:text-white"
              >
                {project.sourceLabel ?? 'Source'}
                <Github className="h-3 w-3 transition-transform duration-200 group-hover/link:scale-110" />
              </a>
            ) : null}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[hsl(220_15%_70%)] transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white">
            Details
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
