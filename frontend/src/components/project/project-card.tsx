import { ArrowUpRight, ExternalLink, Github } from 'lucide-react';
import Link from 'next/link';
import { CloudImage } from '@/components/ui/cloud-image';
import type { Project } from '@/lib/types';
import { initials } from '@/lib/utils';
import { projectCover } from './project-media';

const MAX_TAGS = 4;

export function ProjectCard({ project }: { project: Project }) {
  const cover = projectCover(project);
  const placeholder = (
    <div className="relative flex h-full w-full items-center justify-center">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_40%,hsl(0_0%_100%/0.10),transparent_70%)]"
      />
      <span className="relative font-display text-5xl font-bold tracking-tight text-[hsl(220_25%_88%)]/85">
        {initials(project.name)}
      </span>
    </div>
  );

  return (
    <article className="group glass-card card-sheen ring-conic glow-hover relative h-full overflow-hidden rounded-xl transition-transform duration-300 ease-[var(--ease-premium)] hover:-translate-y-0.5">
      {/* The whole card opens the project; the inner links sit above this overlay. */}
      <Link
        href={`/projects/${project.slug}`}
        aria-label={`Open ${project.name}`}
        className="absolute inset-0 z-[1]"
      />

      <div className="relative aspect-[16/9] overflow-hidden bg-[linear-gradient(135deg,hsl(244_30%_18%/0.85)_0%,hsl(225_30%_12%/0.85)_60%,hsl(275_35%_20%/0.85)_100%)]">
        {cover ? (
          <CloudImage
            src={cover}
            alt={project.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-[1.03]"
            fallback={placeholder}
          />
        ) : (
          placeholder
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[hsl(220_40%_4%/0.60)] via-[hsl(220_40%_4%/0.05)] to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />

        <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[hsl(220_30%_8%/0.55)] text-white shadow-[0_6px_18px_-8px_hsl(220_40%_4%/0.6)] backdrop-blur-md transition-[border-color,background-color] duration-300 ease-[var(--ease-premium)] group-hover:border-white/30 group-hover:bg-[hsl(220_30%_14%/0.75)]">
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>

        {project.category ? (
          <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-[hsl(220_30%_8%/0.55)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(220_25%_92%)] backdrop-blur-md">
            {project.category}
          </div>
        ) : null}
      </div>

      <div className="relative p-3.5">
        <h3 className="line-clamp-1 font-display text-[15px] font-semibold tracking-tight text-[hsl(220_25%_94%)] transition-colors duration-300 group-hover:text-white">
          <span
            aria-hidden
            className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[hsl(152_60%_50%)] align-middle shadow-[0_0_8px_hsl(152_60%_50%/0.7)]"
          />
          {project.name}
        </h3>
        {project.tagline ? (
          <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-[hsl(220_15%_72%)]">
            {project.tagline}
          </p>
        ) : null}

        {project.tech.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {project.tech.slice(0, MAX_TAGS).map((tech) => (
              <span key={tech} className="tag">
                {tech}
              </span>
            ))}
            {project.tech.length > MAX_TAGS ? (
              <span className="tag-muted">+{project.tech.length - MAX_TAGS}</span>
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
                className="group/link inline-flex items-center gap-1 rounded-full border border-white/15 bg-[hsl(220_30%_8%/0.55)] px-2.5 py-1 text-xs font-semibold backdrop-blur-md transition-colors duration-200 hover:border-white/30 hover:bg-[hsl(220_30%_14%/0.7)]"
              >
                <span className="bg-gradient-to-r from-brand-indigo to-brand-violet bg-clip-text text-transparent">
                  {project.liveLabel || 'Live Demo'}
                </span>
                <ExternalLink className="h-3 w-3 text-brand-violet transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
              </a>
            ) : null}
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex items-center gap-1 text-xs font-semibold text-[hsl(220_15%_70%)] transition-colors duration-200 hover:text-white"
              >
                {project.sourceLabel || 'Source'}
                <Github className="h-3 w-3 transition-transform duration-200 group-hover/link:scale-110" />
              </a>
            ) : null}
          </div>
          <span
            aria-hidden
            className="inline-flex items-center gap-1 text-xs font-semibold text-[hsl(220_15%_70%)] transition-[transform,color] duration-300 ease-[var(--ease-premium)] group-hover:translate-x-0.5 group-hover:text-white"
          >
            Details <span>→</span>
          </span>
        </div>
      </div>
    </article>
  );
}
