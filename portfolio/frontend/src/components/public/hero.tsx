'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Braces,
  Code2,
  Cpu,
  FileDown,
  Github,
  Linkedin,
  Mail,
  Twitter,
  Globe,
} from 'lucide-react';
import { Typewriter } from './typewriter';
import { StatusBadge } from './status-badge';
import { GradientButton } from './gradient-button';
import type { Profile } from '@/lib/types';
import { uploadsUrl } from '@/lib/utils';

const easing = [0.22, 1, 0.36, 1] as const;

const DEFAULT_ROLE = 'Full-Stack Developer';
const DEFAULT_TYPEWRITER = ['Software Engineer', 'CS Student', 'Tech Enthusiast'];

function buildHeroCopy(profile: Profile | null | undefined) {
  const phrases = (profile?.headlines ?? [])
    .map((s) => s?.trim())
    .filter((s): s is string => Boolean(s));

  const role = phrases[0] || DEFAULT_ROLE;

  const remaining = phrases.slice(1);
  const typewriterPhrases =
    remaining.length > 0
      ? remaining
      : phrases.length === 1
        ? DEFAULT_TYPEWRITER
        : DEFAULT_TYPEWRITER;

  const subtitle =
    profile?.headline?.trim() ||
    'Building modern, production-grade web apps with care for craft and detail.';

  return { role, typewriterPhrases, subtitle };
}

interface Props {
  profile: Profile | null | undefined;
}

export function Hero({ profile }: Props) {
  const name = profile?.displayName ?? 'Ramez Milad';
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const availability = profile?.availability?.trim() || 'Open to opportunities';
  const { role, typewriterPhrases, subtitle } = buildHeroCopy(profile);
  const socials = profile?.socials ?? {};
  const techPills = ['TypeScript', 'React', 'Next.js', 'NestJS'];

  const prefersReducedMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { amount: 0.4 });
  const [runId, setRunId] = useState(0);
  const wasInView = useRef(true);

  // First mount counts as the first run. Every subsequent re-entry replays.
  useEffect(() => {
    if (inView && !wasInView.current) {
      setRunId((n) => n + 1);
    }
    wasInView.current = inView;
  }, [inView]);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative flex min-h-screen items-center pt-24 sm:pt-28"
      aria-label="Introduction"
    >
      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-20">
        {/* Left: text content */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: easing }}
          className="relative z-10"
        >
          <StatusBadge label={availability} tone="emerald" />

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: easing }}
            className="font-display mt-5 text-[clamp(2rem,5.5vw,3.75rem)] font-bold leading-[1.05] tracking-tight"
          >
            <span className="ek-gradient-text block">{role}</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: easing }}
            className="mt-4 flex h-7 items-center text-base font-medium text-[hsl(var(--foreground)/0.92)] md:text-lg"
          >
            <Typewriter
              phrases={typewriterPhrases}
              holdMs={5000}
              runId={runId}
              loop={false}
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: easing }}
            className="mt-5 max-w-xl text-sm leading-relaxed text-[hsl(var(--muted-foreground))] md:text-base"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: easing }}
            className="mt-6 flex flex-wrap gap-2"
          >
            {techPills.map((t) => (
              <span
                key={t}
                className="rounded-md border border-[hsl(var(--brand-violet-soft)/0.30)] bg-[hsl(var(--brand-violet-soft)/0.06)] px-3 py-1 text-xs font-semibold text-[hsl(var(--brand-indigo))]"
              >
                {t}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: easing }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <GradientButton asChild>
              <a
                href="#portfolio"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById('portfolio')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Projects <ArrowRight className="h-4 w-4" />
              </a>
            </GradientButton>

            <GradientButton asChild variant="outline">
              <a
                href={profile?.resumeUrl ? uploadsUrl(profile.resumeUrl) : '/cv.pdf'}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <FileDown className="h-4 w-4" /> Download CV
              </a>
            </GradientButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-7 flex items-center gap-2.5"
          >
            {socials.github ? (
              <SocialLink href={socials.github} label="GitHub">
                <Github className="h-4 w-4" />
              </SocialLink>
            ) : null}
            {socials.linkedin ? (
              <SocialLink href={socials.linkedin} label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </SocialLink>
            ) : null}
            {socials.x ? (
              <SocialLink href={socials.x} label="X / Twitter">
                <Twitter className="h-4 w-4" />
              </SocialLink>
            ) : null}
            {socials.website ? (
              <SocialLink href={socials.website} label="Website">
                <Globe className="h-4 w-4" />
              </SocialLink>
            ) : null}
            {profile?.email ? (
              <SocialLink href={`mailto:${profile.email}`} label="Email">
                <Mail className="h-4 w-4" />
              </SocialLink>
            ) : null}
          </motion.div>
        </motion.div>

        {/* Right: avatar + orbital CS-themed motion */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: easing, delay: 0.2 }}
          className="relative flex justify-center md:justify-end"
        >
          <div className="relative h-60 w-60 sm:h-72 sm:w-72 md:h-80 md:w-80">
            {/* soft indigo→violet halo behind the photo */}
            <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-[hsl(var(--brand-indigo)/0.28)] to-[hsl(var(--brand-violet-soft)/0.28)] opacity-60 blur-3xl animate-pulse-glow" />

            {/* Photo (bobs gently) */}
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative h-full w-full"
            >
              <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-[hsl(var(--brand-violet-soft)/0.40)] bg-gradient-to-br from-[hsl(var(--brand-indigo)/0.12)] to-[hsl(var(--brand-violet-soft)/0.12)] shadow-[0_30px_80px_-22px_hsl(var(--brand-violet-soft)/0.32)]">
                {profile?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={uploadsUrl(profile.avatarUrl)}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-display text-[6rem] font-bold tracking-tight">
                      <span className="ek-gradient-text-static">{initials}</span>
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Subtle static decorative rings — always visible (cheap) */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full border border-[hsl(var(--brand-violet-soft)/0.16)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-3 rounded-full border border-[hsl(var(--brand-indigo)/0.12)]"
            />

            {/* Orbital CS icons — disabled under prefers-reduced-motion */}
            {!prefersReducedMotion ? (
              <>
                <OrbitIcon duration={18} radius="-inset-1" reverse={false}>
                  <Code2 className="h-3.5 w-3.5 text-[hsl(var(--brand-indigo))]" />
                </OrbitIcon>
                <OrbitIcon duration={26} radius="-inset-6" reverse={true}>
                  <Braces className="h-3.5 w-3.5 text-[hsl(var(--brand-violet-soft))]" />
                </OrbitIcon>
                <OrbitIcon duration={34} radius="-inset-10" reverse={false}>
                  <Cpu className="h-3.5 w-3.5 text-[hsl(var(--brand-indigo))]" />
                </OrbitIcon>
              </>
            ) : null}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function OrbitIcon({
  duration,
  radius,
  reverse,
  children,
}: {
  duration: number;
  radius: string;
  reverse: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      aria-hidden
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
      className={`pointer-events-none absolute ${radius} rounded-full`}
    >
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[hsl(var(--brand-violet-soft)/0.35)] bg-[hsl(var(--card))] shadow-[0_4px_14px_-4px_hsl(0_0%_0%/0.5)]">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="ek-glass flex h-9 w-9 items-center justify-center rounded-full text-[hsl(var(--muted-foreground))] transition-all duration-300 hover:-translate-y-0.5 hover:text-[hsl(var(--brand-indigo))] ek-glow"
    >
      {children}
    </a>
  );
}
