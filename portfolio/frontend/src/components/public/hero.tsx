'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion';
import {
  ArrowRight,
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
import { IconCloud } from '@/components/magicui/icon-cloud';
import type { Profile } from '@/lib/types';
import { uploadsUrl } from '@/lib/utils';

// Tech icons rendered into the 3D hero cloud. `color` overrides the
// official brand color when that color disappears against the dark canvas
// (Next.js #000 and GitHub #181717 were rendering as solid black squares).
const techCloud: { slug: string; color?: string }[] = [
  { slug: 'typescript' },
  { slug: 'javascript' },
  { slug: 'react' },
  { slug: 'nextdotjs', color: 'ffffff' },
  { slug: 'nodedotjs' },
  { slug: 'nestjs' },
  { slug: 'postgresql' },
  { slug: 'mongodb' },
  { slug: 'tailwindcss' },
  { slug: 'docker' },
  { slug: 'git' },
  { slug: 'github', color: 'ffffff' },
];
const techCloudImages = techCloud.map(
  ({ slug, color }) => `https://cdn.simpleicons.org/${slug}/${color ?? slug}`,
);

const easing = [0.22, 1, 0.36, 1] as const;

// One parent variants tree instead of six separate motion.divs each with
// their own delay. Framer-motion only bookkeeps the parent timeline and
// children inherit through `staggerChildren`, halving reconciliation work
// at mount and keeping the visual rhythm identical.
const heroContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const heroFadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easing },
  },
};

const heroFadeLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: easing },
  },
};

const heroHeadline: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easing },
  },
};

const heroFadeOnly: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

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
  const availability = profile?.availability?.trim() || 'Open to opportunities';
  const { role, typewriterPhrases, subtitle } = buildHeroCopy(profile);
  const socials = profile?.socials ?? {};
  const techPills = ['TypeScript', 'React', 'Next.js', 'NestJS'];

  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { amount: 0.4 });
  const [runId, setRunId] = useState(0);
  const wasInView = useRef(true);
  const prefersReduced = useReducedMotion();

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
          variants={heroContainerVariants}
          initial={prefersReduced ? false : 'hidden'}
          animate="visible"
          className="relative z-10"
        >
          <motion.div variants={prefersReduced ? undefined : heroFadeLeft}>
            <StatusBadge label={availability} tone="emerald" />
          </motion.div>

          <motion.h1
            variants={prefersReduced ? undefined : heroHeadline}
            className="font-display mt-5 text-[clamp(2rem,5.5vw,3.75rem)] font-bold leading-[1.05] tracking-tight"
          >
            <span className="ek-hero-title block">{role}</span>
          </motion.h1>

          <motion.div
            variants={prefersReduced ? undefined : heroFadeUp}
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
            variants={prefersReduced ? undefined : heroFadeUp}
            className="mt-5 max-w-xl text-sm leading-relaxed text-[hsl(var(--muted-foreground))] md:text-base"
          >
            {subtitle}
          </motion.p>

          <motion.div
            variants={prefersReduced ? undefined : heroFadeUp}
            className="mt-6 flex flex-wrap gap-2"
          >
            {techPills.map((t) => (
              <span key={t} className="ek-pill">
                {t}
              </span>
            ))}
          </motion.div>

          <motion.div
            variants={prefersReduced ? undefined : heroFadeUp}
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

            {profile?.resumeUrl ? (
              <GradientButton asChild variant="outline">
                <a
                  href={uploadsUrl(profile.resumeUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <FileDown className="h-4 w-4" /> Download CV
                </a>
              </GradientButton>
            ) : null}
          </motion.div>

          <motion.div
            variants={prefersReduced ? undefined : heroFadeOnly}
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

        {/* Right: tech icon cloud */}
        <div className="relative flex size-full items-center justify-center overflow-visible md:justify-end md:pr-2 lg:pr-6">
          <IconCloud images={techCloudImages} />
        </div>
      </div>
    </section>
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
