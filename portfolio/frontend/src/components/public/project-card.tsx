'use client';

import { useRef } from 'react';
import Link from 'next/link';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '../ui/badge';
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
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
        className="group relative block h-full overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-shadow duration-500 hover:shadow-[0_20px_60px_-15px_hsl(var(--accent)/0.35)]"
      >
        {/* hover gradient halo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 0%, hsl(var(--accent) / 0.18) 0%, transparent 70%)',
          }}
        />

        <div
          className={`relative overflow-hidden bg-[hsl(var(--muted))] ${
            isFeature ? 'aspect-[16/10] md:aspect-[16/9]' : 'aspect-[16/10]'
          }`}
        >
          {cover ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cover}
                alt={project.name}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent"
              />
            </>
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, hsl(var(--accent) / 0.18), hsl(var(--accent-secondary) / 0.16) 50%, hsl(var(--accent-tertiary) / 0.14))',
              }}
            >
              <span className="font-display text-5xl font-semibold tracking-tight text-[hsl(var(--foreground))]/30">
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
          <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--background))]/85 text-[hsl(var(--foreground))] opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 translate-x-1 -translate-y-1">
            <ArrowUpRight className="h-4 w-4" />
          </div>

          {project.role ? (
            <div className="absolute bottom-4 left-4 rounded-full bg-[hsl(var(--background))]/85 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--foreground))] backdrop-blur">
              {project.role}
            </div>
          ) : null}
        </div>

        <div className="relative z-10 p-6">
          <h3
            className={`font-display tracking-tight ${
              isFeature ? 'text-2xl font-semibold md:text-3xl' : 'text-lg font-semibold'
            }`}
          >
            <Link href={`/projects/${project.slug}`} className="link-underline">
              {project.name}
            </Link>
          </h3>
          {project.tagline ? (
            <p className="mt-2 line-clamp-2 text-sm text-[hsl(var(--muted-foreground))]">
              {project.tagline}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-1.5">
            {project.tech.slice(0, isFeature ? 7 : 5).map((t) => (
              <Badge key={t} variant="outline" className="rounded-full text-[10px]">
                {t}
              </Badge>
            ))}
            {project.tech.length > (isFeature ? 7 : 5) ? (
              <Badge variant="outline" className="rounded-full text-[10px]">
                +{project.tech.length - (isFeature ? 7 : 5)}
              </Badge>
            ) : null}
          </div>
        </div>
      </motion.a>
    </motion.div>
  );
}
