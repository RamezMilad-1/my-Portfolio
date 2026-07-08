'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { m } from 'framer-motion';
import { ArrowUpRight, ExternalLink, Github } from 'lucide-react';
import { useScrollReveal } from '../motion/use-scroll-reveal';
import {
  DISTANCE,
  EASE_PREMIUM,
  DURATION,
  STAGGER,
  VIEWPORT,
  staggerDelay,
} from '../motion/tokens';
import type { Project } from '@/lib/types';

interface Props {
  project: Project;
  index?: number;
}

export function ProjectCardV2({ project, index = 0 }: Props) {
  const { ref, initial, animate } = useScrollReveal<HTMLDivElement>({
    y: DISTANCE.lg,
    margin: VIEWPORT.card,
  });

  const cover =
    project.coverImageUrl ||
    project.media?.find((m) => m.kind === 'image')?.url ||
    null;

  // Fall back to the initials placeholder if the cover fails to load, instead
  // of leaving the browser's broken-image glyph (same pattern as the detail page).
  const [coverErrored, setCoverErrored] = useState(false);

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <m.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{
        duration: DURATION.slow,
        ease: EASE_PREMIUM,
        delay: staggerDelay(index, STAGGER.loose),
      }}
      className="group ek-glass ek-card-sheen ek-ring-conic ek-glow relative overflow-hidden rounded-xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5"
    >
      <Link
        href={`/projects/${project.slug}`}
        aria-label={`Open ${project.name}`}
        className="absolute inset-0 z-[1]"
      >
        <span className="sr-only">Open {project.name}</span>
      </Link>

      <div className="relative aspect-[16/9] overflow-hidden bg-[linear-gradient(135deg,hsl(244_30%_18%/0.85)_0%,hsl(225_30%_12%/0.85)_60%,hsl(275_35%_20%/0.85)_100%)]">
        {cover && !coverErrored ? (
          <Image
            src={cover}
            alt={project.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            onError={() => setCoverErrored(true)}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
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

        <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[hsl(220_30%_8%/0.55)] text-white backdrop-blur-md shadow-[0_6px_18px_-8px_hsl(220_40%_4%/0.6)] transition-[border-color,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-white/30 group-hover:bg-[hsl(220_30%_14%/0.75)]">
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {project.category ? (
            <div className="rounded-full border border-white/15 bg-[hsl(220_30%_8%/0.55)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(220_25%_92%)] backdrop-blur-md">
              {project.category}
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative p-3.5">
        <h3 className="font-display line-clamp-1 text-[15px] font-semibold tracking-tight text-[hsl(220_25%_94%)] transition-colors duration-300 group-hover:text-white">
          {project.status === 'published' ? (
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[hsl(152_60%_50%)] align-middle shadow-[0_0_8px_hsl(152_60%_50%/0.7)]" />
          ) : null}
          {project.name}
        </h3>
        {project.tagline ? (
          <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-[hsl(220_15%_72%)]">
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
                className="group/link inline-flex items-center gap-1 rounded-full border border-white/15 bg-[hsl(220_30%_8%/0.55)] px-2.5 py-1 text-xs font-semibold backdrop-blur-md transition-colors duration-200 hover:border-white/30 hover:bg-[hsl(220_30%_14%/0.7)]"
              >
                <span className="bg-gradient-to-r from-[hsl(var(--brand-indigo))] to-[hsl(var(--brand-violet))] bg-clip-text text-transparent">
                  {project.liveLabel}
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
                {project.sourceLabel}
                <Github className="h-3 w-3 transition-transform duration-200 group-hover/link:scale-110" />
              </a>
            ) : null}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[hsl(220_15%_70%)] transition-[transform,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:text-white">
            Details
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </m.div>
  );
}
