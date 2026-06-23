'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import {
  ArrowRight,
  FileDown,
  Github,
  Linkedin,
  Mail,
  Twitter,
  Globe,
} from 'lucide-react';
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

// One parent variants tree instead of separate motion.divs each with their
// own delay. Framer-motion bookkeeps the parent timeline and children
// inherit through `staggerChildren`.
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
const DEFAULT_SUBTITLE =
  'Full-stack TypeScript — typed all the way through, with the kind of detail that holds up six months later.';

function buildHeroCopy(profile: Profile | null | undefined) {
  const role =
    (profile?.headlines ?? [])
      .map((s) => s?.trim())
      .find((s): s is string => Boolean(s)) || DEFAULT_ROLE;

  const subtitle = profile?.headline?.trim() || DEFAULT_SUBTITLE;

  return { role, subtitle };
}

interface Props {
  profile: Profile | null | undefined;
}

export function Hero({ profile }: Props) {
  const availability = profile?.availability?.trim() || 'Open to opportunities';
  const displayName = profile?.displayName?.trim() || 'Ramez Milad';
  const { role, subtitle } = buildHeroCopy(profile);
  const socials = profile?.socials ?? {};
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center pt-24 sm:pt-28"
      aria-label="Introduction"
    >
      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-20">
        <motion.div
          variants={heroContainerVariants}
          initial={prefersReduced ? false : 'hidden'}
          animate="visible"
          className="hero-copy relative z-10 max-w-[38rem]"
        >
          <motion.div variants={prefersReduced ? undefined : heroFadeLeft}>
            <StatusBadge
              label={availability}
              tone="emerald"
              className="px-3 py-1 text-[11px]"
              borderGradient="linear-gradient(90deg, hsl(246 46% 58% / 0.72), hsl(272 38% 62% / 0.58))"
              haloClassName="opacity-25 blur-sm"
              pingClassName="bg-[hsl(152_55%_54%)] opacity-35"
              dotClassName="bg-[hsl(152_55%_54%)] opacity-90"
              labelClassName="font-medium text-[hsl(220_24%_88%)]"
              iconClassName="h-3 w-3 text-[hsl(260_26%_72%)] opacity-65"
            />
          </motion.div>

          <motion.p
            variants={prefersReduced ? undefined : heroFadeUp}
            className="mt-4 text-[11px] font-medium uppercase tracking-[0.36em] text-[hsl(260_24%_74%/0.82)] md:text-xs"
          >
            {displayName}
          </motion.p>

          <motion.h1
            variants={prefersReduced ? undefined : heroHeadline}
            className="mt-2 font-sans text-[clamp(2rem,4.6vw,3rem)] font-semibold leading-[1.03] tracking-[0]"
          >
            <span
              className="ek-hero-title block whitespace-nowrap"
              style={{
                backgroundImage:
                  'linear-gradient(110deg, hsl(258 70% 78%) 0%, hsl(274 66% 74%) 30%, hsl(286 72% 86%) 46%, hsl(266 72% 80%) 56%, hsl(280 62% 75%) 70%, hsl(258 70% 78%) 100%)',
                filter:
                  'drop-shadow(0 1px 0 hsl(0 0% 100% / 0.08)) drop-shadow(0 6px 22px hsl(270 48% 42% / 0.14))',
              }}
            >
              {role}
            </span>
          </motion.h1>

          <motion.p
            variants={prefersReduced ? undefined : heroFadeUp}
            className="mt-4 max-w-[36rem] text-[15px] leading-[1.75] text-[hsl(220_18%_76%)] md:text-[16px]"
          >
            {subtitle}
          </motion.p>

          <motion.div
            variants={prefersReduced ? undefined : heroFadeUp}
            className="mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3"
          >
            <GradientButton asChild className="hero-cta font-medium">
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
              <GradientButton
                asChild
                variant="outline"
                className="hero-cta font-medium"
              >
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
            className="mt-6 flex items-center gap-2.5"
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
      className="hero-social-link ek-glass flex h-9 w-9 items-center justify-center rounded-full text-[hsl(220_18%_72%)] transition-all duration-300 hover:-translate-y-0.5 hover:text-[hsl(230_26%_92%)]"
    >
      {children}
    </a>
  );
}
