'use client';

import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useScrollReveal } from '../motion/use-scroll-reveal';
import { uploadsUrl } from '@/lib/utils';
import type { Project } from '@/lib/types';

const easing = [0.22, 1, 0.36, 1] as const;

interface Props {
  project: Project;
  index?: number;
  variant?: 'default' | 'feature';
}

export function ProjectCard({ project, index = 0, variant = 'default' }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const prefersReduced = useReducedMotion();
  const { ref: revealRef, initial, animate } = useScrollReveal<HTMLDivElement>({
    y: 20,
    margin: '-50px',
  });

  // tilt — pointer-driven 3D rotate
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(ry, { stiffness: 220, damping: 18, mass: 0.4 });
  const rotateX = useTransform(sx, (v) => `${v}deg`);
  const rotateY = useTransform(sy, (v) => `${v}deg`);

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefersReduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rx.set(-py * 6);
    ry.set(px * 6);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  const cover =
    project.coverImageUrl
      ? uploadsUrl(project.coverImageUrl)
      : project.media?.find((m) => m.kind === 'image')?.url
        ? uploadsUrl(project.media.find((m) => m.kind === 'image')!.url)
        : null;

  const isFeature = variant === 'feature';

  return (
    <motion.div
      ref={revealRef}
      initial={initial}
      animate={animate}
      transition={{ duration: 0.7, delay: index * 0.06, ease: easing }}
      style={{ perspective: 1000 }}
      className="h-full"
    >
      <motion.a
        ref={ref}
        href={`/projects/${project.slug}`}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="group ek-glass ek-card-sheen ek-ring-conic ek-glow relative block h-full overflow-hidden rounded-2xl transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1"
      >
        {/* soft white halo on hover (replaces magenta glow) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 0%, hsl(0 0% 100% / 0.06) 0%, transparent 70%)',
          }}
        />

        <div
          className={`relative overflow-hidden bg-[linear-gradient(135deg,hsl(244_30%_18%/0.85)_0%,hsl(225_30%_12%/0.85)_60%,hsl(275_35%_20%/0.85)_100%)] ${
            isFeature ? 'aspect-[16/10] md:aspect-[16/9]' : 'aspect-[16/9]'
          }`}
        >
          {cover ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cover}
                alt={project.name}
                className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[hsl(220_40%_4%/0.55)] via-[hsl(220_40%_4%/0.05)] to-transparent"
              />
            </>
          ) : (
            <div className="relative flex h-full w-full items-center justify-center">
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_40%,hsl(0_0%_100%/0.10),transparent_70%)]"
              />
              <span className="font-display relative text-5xl font-semibold tracking-tight text-[hsl(220_25%_88%)]/85">
                {project.name
                  .split(' ')
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()}
              </span>
            </div>
          )}

          {/* corner badge */}
          <div className="absolute right-4 top-4 flex h-10 w-10 -translate-y-1 translate-x-1 items-center justify-center rounded-full border border-white/15 bg-[hsl(220_30%_8%/0.55)] text-white opacity-0 shadow-[0_6px_18px_-8px_hsl(220_40%_4%/0.6)] backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:translate-y-0 group-hover:border-white/30 group-hover:bg-[hsl(220_30%_14%/0.75)] group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4" />
          </div>

          {project.role ? (
            <div className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-[hsl(220_30%_8%/0.55)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(220_25%_92%)] backdrop-blur-md">
              {project.role}
            </div>
          ) : null}
        </div>

        <div className="relative z-10 p-4">
          <h3
            className={`font-display tracking-tight text-[hsl(220_25%_94%)] transition-colors duration-300 group-hover:text-white ${
              isFeature ? 'text-xl font-semibold md:text-2xl' : 'text-[15px] font-semibold'
            }`}
          >
            {project.name}
          </h3>
          {project.tagline ? (
            <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-[hsl(220_15%_72%)]">
              {project.tagline}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-1">
            {project.tech.slice(0, isFeature ? 7 : 5).map((t) => (
              <Badge key={t} variant="outline" className="ek-tag border-0 px-2.5">
                {t}
              </Badge>
            ))}
            {project.tech.length > (isFeature ? 7 : 5) ? (
              <Badge variant="outline" className="ek-tag-muted border-0 px-2.5">
                +{project.tech.length - (isFeature ? 7 : 5)}
              </Badge>
            ) : null}
          </div>
        </div>
      </motion.a>
    </motion.div>
  );
}
