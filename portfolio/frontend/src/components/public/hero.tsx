'use client';

import { useRef } from 'react';
import Link from 'next/link';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { ArrowRight, FileDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Magnetic } from '../motion/magnetic';
import type { Profile } from '@/lib/types';
import { uploadsUrl } from '@/lib/utils';

const easing = [0.22, 1, 0.36, 1] as const;

export function Hero({ profile }: { profile: Profile | null | undefined }) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReduced ? '0%' : '20%']);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1, prefersReduced ? 1 : 1.04]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReduced ? '0%' : '-12%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.8], [1, prefersReduced ? 1 : 0.4]);

  const name = profile?.displayName ?? 'Ramez Milad';
  const headline =
    profile?.headline ??
    '3rd-year Computer Science (Software Engineering) student. Full-stack developer working in TypeScript, React, NestJS, and MongoDB.';
  const availability = profile?.availability?.trim();
  const education = profile?.education?.trim();

  return (
    <section
      ref={ref}
      className="aurora relative overflow-hidden"
      aria-label="Introduction"
    >
      <div className="noise pointer-events-none absolute inset-0" />

      <div className="relative mx-auto grid min-h-[88vh] max-w-6xl grid-cols-1 items-center gap-10 px-4 py-24 sm:px-6 md:grid-cols-12 md:py-32">
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="md:col-span-7 md:pr-8"
        >
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easing }}
            className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))]/60 px-3 py-1 text-xs font-medium text-[hsl(var(--muted-foreground))] backdrop-blur"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-[hsl(var(--accent))] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />
            </span>
            {availability || 'available for collaboration'}
          </motion.span>

          {education ? (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: easing }}
              className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]"
            >
              {education}
            </motion.p>
          ) : null}

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.05, ease: easing }}
            className="font-display mt-5 text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[1.02] tracking-tight"
          >
            <span className="block">{name}</span>
            <span className="gradient-text mt-1 block">building things that ship.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: easing }}
            className="mt-7 max-w-xl text-base text-[hsl(var(--muted-foreground))] md:text-lg"
          >
            {headline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28, ease: easing }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Magnetic>
              <Button
                asChild
                size="lg"
                className="group relative overflow-hidden rounded-full px-7 shadow-[0_8px_30px_-8px_hsl(var(--accent)/0.6)]"
              >
                <Link href="/projects">
                  <span className="relative z-10">View projects</span>
                  <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </Magnetic>

            {profile?.resumeUrl ? (
              <Magnetic>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="rounded-full px-7 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.45)]"
                >
                  <a
                    href={uploadsUrl(profile.resumeUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileDown className="h-4 w-4" /> Resume
                  </a>
                </Button>
              </Magnetic>
            ) : (
              <Button asChild variant="outline" size="lg" className="rounded-full px-6">
                <Link href="/about">About me</Link>
              </Button>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="mt-12 flex items-center gap-6 text-xs uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]"
          >
            <span>Full-stack</span>
            <span className="h-px w-8 bg-[hsl(var(--border))]" />
            <span>TypeScript · React · NestJS</span>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: photoY, scale: photoScale }}
          className="md:col-span-5"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.1, ease: easing }}
            className="relative mx-auto aspect-[4/5] w-full max-w-sm"
          >
            <div
              aria-hidden
              className="absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-br from-[hsl(var(--accent))]/30 via-[hsl(var(--accent-secondary))]/20 to-transparent blur-3xl"
            />
            <div className="ring-lift relative h-full w-full overflow-hidden rounded-[28px] border border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
              {profile?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={uploadsUrl(profile.avatarUrl)}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, hsl(var(--accent) / 0.18) 0%, hsl(var(--accent-secondary) / 0.18) 50%, hsl(var(--accent-tertiary) / 0.18) 100%)',
                  }}
                >
                  <span className="font-display text-[7rem] font-bold tracking-tight text-[hsl(var(--foreground))]/15">
                    {name
                      .split(' ')
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()}
                  </span>
                </div>
              )}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
              />
            </div>

            {/* floating chip */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: easing }}
              className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 shadow-xl sm:flex"
            >
              <div className="text-xs">
                <p className="font-medium text-[hsl(var(--foreground))]">Currently</p>
                <p className="text-[hsl(var(--muted-foreground))]">
                  Year 3 · Software Engineering
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* scroll cue */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">
        <motion.span
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block"
        >
          scroll
        </motion.span>
      </div>
    </section>
  );
}
