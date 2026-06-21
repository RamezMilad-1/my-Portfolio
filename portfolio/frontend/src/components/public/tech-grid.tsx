'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useScrollReveal } from '../motion/use-scroll-reveal';

/**
 * Multicolor brand logos come from Devicon (https://devicon.dev).
 * Each entry maps a normalized tech name to `[slug, variant]`. Variant is
 * usually "original" (the colorful form). For techs Devicon doesn't carry,
 * we fall back to the monochrome Simple Icons CDN and finally to a letter.
 */
const DEVICON: Record<string, [string, string]> = {
  // languages
  html: ['html5', 'original'],
  html5: ['html5', 'original'],
  css: ['css3', 'original'],
  css3: ['css3', 'original'],
  sass: ['sass', 'original'],
  scss: ['sass', 'original'],
  javascript: ['javascript', 'original'],
  js: ['javascript', 'original'],
  typescript: ['typescript', 'original'],
  ts: ['typescript', 'original'],
  python: ['python', 'original'],
  java: ['java', 'original'],
  c: ['c', 'original'],
  'c++': ['cplusplus', 'original'],
  cpp: ['cplusplus', 'original'],
  'c#': ['csharp', 'original'],
  csharp: ['csharp', 'original'],
  go: ['go', 'original-wordmark'],
  golang: ['go', 'original-wordmark'],
  rust: ['rust', 'plain'],
  ruby: ['ruby', 'original'],
  php: ['php', 'original'],
  swift: ['swift', 'original'],
  kotlin: ['kotlin', 'original'],
  dart: ['dart', 'original'],
  r: ['r', 'original'],
  bash: ['bash', 'original'],
  shell: ['bash', 'original'],

  // frontend frameworks / libs
  react: ['react', 'original'],
  'react.js': ['react', 'original'],
  reactjs: ['react', 'original'],
  'react native': ['react', 'original'],
  reactnative: ['react', 'original'],
  next: ['nextjs', 'original'],
  'next.js': ['nextjs', 'original'],
  nextjs: ['nextjs', 'original'],
  vue: ['vuejs', 'original'],
  'vue.js': ['vuejs', 'original'],
  vuejs: ['vuejs', 'original'],
  nuxt: ['nuxtjs', 'original'],
  svelte: ['svelte', 'original'],
  angular: ['angularjs', 'original'],
  redux: ['redux', 'original'],
  vite: ['vitejs', 'original'],
  webpack: ['webpack', 'original'],
  babel: ['babel', 'original'],
  storybook: ['storybook', 'original'],

  // styling
  tailwind: ['tailwindcss', 'original'],
  'tailwind css': ['tailwindcss', 'original'],
  tailwindcss: ['tailwindcss', 'original'],
  bootstrap: ['bootstrap', 'original'],
  materialui: ['materialui', 'original'],
  'material ui': ['materialui', 'original'],
  mui: ['materialui', 'original'],

  // backend / runtime
  node: ['nodejs', 'original'],
  'node.js': ['nodejs', 'original'],
  nodejs: ['nodejs', 'original'],
  deno: ['denojs', 'original'],
  express: ['express', 'original'],
  'express.js': ['express', 'original'],
  expressjs: ['express', 'original'],
  nest: ['nestjs', 'original'],
  nestjs: ['nestjs', 'original'],
  'nest.js': ['nestjs', 'original'],
  fastapi: ['fastapi', 'original'],
  django: ['django', 'plain'],
  flask: ['flask', 'original'],
  spring: ['spring', 'original'],
  laravel: ['laravel', 'original'],
  graphql: ['graphql', 'plain'],

  // databases
  mongodb: ['mongodb', 'original'],
  mongo: ['mongodb', 'original'],
  mongoose: ['mongoose', 'original'],
  postgres: ['postgresql', 'original'],
  postgresql: ['postgresql', 'original'],
  mysql: ['mysql', 'original'],
  sqlite: ['sqlite', 'original'],
  redis: ['redis', 'original'],
  firebase: ['firebase', 'plain'],
  supabase: ['supabase', 'original'],
  prisma: ['prisma', 'original'],

  // cloud / hosting / devops
  aws: ['amazonwebservices', 'original-wordmark'],
  'amazon web services': ['amazonwebservices', 'original-wordmark'],
  gcp: ['googlecloud', 'original'],
  'google cloud': ['googlecloud', 'original'],
  azure: ['azure', 'original'],
  vercel: ['vercel', 'original'],
  netlify: ['netlify', 'original'],
  heroku: ['heroku', 'original'],
  docker: ['docker', 'original'],
  kubernetes: ['kubernetes', 'plain'],
  k8s: ['kubernetes', 'plain'],
  terraform: ['terraform', 'original'],
  jenkins: ['jenkins', 'original'],
  'github actions': ['githubactions', 'plain'],
  githubactions: ['githubactions', 'plain'],

  // tools
  git: ['git', 'original'],
  github: ['github', 'original'],
  gitlab: ['gitlab', 'original'],
  bitbucket: ['bitbucket', 'original'],
  npm: ['npm', 'original-wordmark'],
  yarn: ['yarn', 'original'],
  pnpm: ['pnpm', 'original'],
  postman: ['postman', 'original'],
  figma: ['figma', 'original'],
  jira: ['jira', 'original'],
  notion: ['notion', 'original'],
  trello: ['trello', 'plain'],

  // testing
  jest: ['jest', 'plain'],
  cypress: ['cypressio', 'original'],
  selenium: ['selenium', 'original'],

  // data / ml
  pandas: ['pandas', 'original'],
  numpy: ['numpy', 'original'],
  tensorflow: ['tensorflow', 'original'],
  pytorch: ['pytorch', 'original'],
  jupyter: ['jupyter', 'original'],

  // mobile
  flutter: ['flutter', 'original'],
  ionic: ['ionic', 'original'],
};

/**
 * Logos whose official brand color is near-black (Next.js #000, GitHub
 * #181717, etc.) disappear against the dark theme — they render as a
 * solid black blob. For those, force a fully-formed URL with a light
 * color override so the icon stays readable.
 */
const ICON_OVERRIDE: Record<string, string> = {
  next: 'https://cdn.simpleicons.org/nextdotjs/ffffff',
  'next.js': 'https://cdn.simpleicons.org/nextdotjs/ffffff',
  nextjs: 'https://cdn.simpleicons.org/nextdotjs/ffffff',
};

/**
 * Fallback monochrome icons via Simple Icons CDN, in their official brand
 * color (since omitting the color suffix yields the native brand hex).
 */
const SIMPLE_ICONS: Record<string, string> = {
  jwt: 'jsonwebtokens',
  jsonwebtokens: 'jsonwebtokens',
  axios: 'axios',
  plotly: 'plotly',
  zod: 'zod',
  trpc: 'trpc',
  prettier: 'prettier',
  eslint: 'eslint',
  swc: 'swc',
  esbuild: 'esbuild',
  turborepo: 'turborepo',
  nx: 'nx',
  vitest: 'vitest',
  playwright: 'playwright',
  'styled components': 'styledcomponents',
  styledcomponents: 'styledcomponents',
  framer: 'framer',
  'framer motion': 'framer',
  socketio: 'socketdotio',
  'socket.io': 'socketdotio',
  passport: 'passport',
  passportjs: 'passport',
  helmet: 'helmet',
  strapi: 'strapi',
  sanity: 'sanity',
  cloudflare: 'cloudflare',
  digitalocean: 'digitalocean',
  render: 'render',
  railway: 'railway',
  scikit: 'scikitlearn',
  'scikit-learn': 'scikitlearn',
  d3: 'd3dotjs',
  'd3.js': 'd3dotjs',
  matplotlib: 'matplotlib',
  markdown: 'markdown',
  swagger: 'swagger',
  openapi: 'openapiinitiative',
};

function normalize(name: string): string {
  return name.toLowerCase().trim();
}

function deviconUrl(slug: string, variant: string): string {
  return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-${variant}.svg`;
}

function simpleIconUrl(slug: string): string {
  return `https://cdn.simpleicons.org/${slug}`;
}

function lookupDevicon(name: string): [string, string] | null {
  const key = normalize(name);
  if (DEVICON[key]) return DEVICON[key];
  const stripped = key.replace(/[^a-z0-9]/g, '');
  if (DEVICON[stripped]) return DEVICON[stripped];
  return null;
}

function lookupSimpleIcon(name: string): string | null {
  const key = normalize(name);
  if (SIMPLE_ICONS[key]) return SIMPLE_ICONS[key];
  const stripped = key.replace(/[^a-z0-9]/g, '');
  if (SIMPLE_ICONS[stripped]) return SIMPLE_ICONS[stripped];
  return null;
}

function lookupOverride(name: string): string | null {
  const key = normalize(name);
  if (ICON_OVERRIDE[key]) return ICON_OVERRIDE[key];
  const stripped = key.replace(/[^a-z0-9]/g, '');
  if (ICON_OVERRIDE[stripped]) return ICON_OVERRIDE[stripped];
  return null;
}

type Stage = 'devicon' | 'simpleicons' | 'fallback';

function TechIcon({ name }: { name: string }) {
  const override = lookupOverride(name);
  const devicon = lookupDevicon(name);
  const simpleIcon = lookupSimpleIcon(name);
  const initial: Stage = override
    ? 'devicon'
    : devicon
      ? 'devicon'
      : simpleIcon
        ? 'simpleicons'
        : 'fallback';
  const [stage, setStage] = useState<Stage>(initial);

  if (stage === 'devicon' && (override || devicon)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={override ?? deviconUrl(devicon![0], devicon![1])}
        alt=""
        aria-hidden
        width={32}
        height={32}
        loading="lazy"
        onError={() => setStage(simpleIcon ? 'simpleicons' : 'fallback')}
        className="h-8 w-8 transition-transform duration-300 group-hover:scale-110"
      />
    );
  }

  if (stage === 'simpleicons' && simpleIcon) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={simpleIconUrl(simpleIcon)}
        alt=""
        aria-hidden
        width={32}
        height={32}
        loading="lazy"
        onError={() => setStage('fallback')}
        className="h-8 w-8 transition-transform duration-300 group-hover:scale-110"
      />
    );
  }

  return (
    <span
      aria-hidden
      className="font-display flex h-8 w-8 items-center justify-center text-lg font-bold"
    >
      <span className="ek-gradient-text-static">
        {name.charAt(0).toUpperCase()}
      </span>
    </span>
  );
}

type TechGridEntry = { name: string; category?: string };

interface Props {
  items: TechGridEntry[];
}

export function TechGrid({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="ek-glass mx-auto max-w-md rounded-2xl p-8 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-[hsl(var(--brand-violet))]" />
        <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
          Tech stack will appear here as projects are added.
        </p>
      </div>
    );
  }

  const groups = items.reduce<Record<string, TechGridEntry[]>>((acc, it) => {
    const key = it.category?.trim() || 'Other';
    (acc[key] ??= []).push(it);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(groups).map(([category, list]) => (
        <div key={category} className="space-y-4">
          <p className="font-display text-[11.5px] font-semibold uppercase tracking-[0.24em] text-[hsl(220_22%_76%)]">
            {category}
          </p>
          <div className="grid grid-cols-4 gap-x-2 gap-y-5 sm:grid-cols-5 sm:gap-x-3 sm:gap-y-6 md:grid-cols-6 lg:grid-cols-7">
            {list.map((item, i) => (
              <TechGridItem
                key={`${category}-${item.name}`}
                tech={item.name}
                index={i}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TechGridItem({ tech, index }: { tech: string; index: number }) {
  const { ref, initial, animate } = useScrollReveal<HTMLDivElement>({
    y: 20,
    margin: '-50px',
  });
  const prefersReduced = useReducedMotion();

  // Vary the bob per item so the grid drifts independently. Pure CSS
  // keyframe (`.ek-bob`) — driven by inline custom properties, runs on the
  // compositor, no per-icon framer-motion infinite loop.
  const bobDuration = 4 + (index % 5) * 0.6; // 4s … 6.4s
  const bobDelay = (index % 7) * 0.35; // 0s … 2.1s
  const bobAmplitude = 3 + (index % 3); // 3px … 5px

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{
        duration: 0.5,
        delay: index * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
      // Outer cell is the hover target. `py-2` adds an invisible cushion so
      // the cursor stays inside even while the inner element bobs — that
      // prevents the halo from flickering on/off during hover.
      className="group flex cursor-default flex-col items-center gap-1.5 py-2"
    >
      <div
        className={`flex flex-col items-center gap-1.5 ${prefersReduced ? '' : 'ek-bob'}`}
        style={
          prefersReduced
            ? undefined
            : ({
                ['--bob' as string]: `-${bobAmplitude}px`,
                ['--bob-duration' as string]: `${bobDuration}s`,
                ['--bob-delay' as string]: `${bobDelay}s`,
              } as React.CSSProperties)
        }
      >
        {/* Fixed stage. Halos live here and NEVER transform — only the icon
            inside transforms on hover. Browsers can drop a blur filter when
            its parent transforms; keeping the halo's ancestors transform-free
            guarantees there's no repaint glitch and no visible on/off. */}
        <div
          className="relative isolate flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14"
          style={{ willChange: 'auto' }}
        >
          {/* Outer indigo glow — wide & soft */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -m-6 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsl(var(--brand-indigo)/0.30),transparent_75%)] blur-2xl"
          />
          {/* Inner violet halo — tighter, more intense */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -m-3 rounded-full bg-[radial-gradient(55%_55%_at_50%_50%,hsl(var(--brand-violet)/0.48),transparent_72%)] blur-xl"
          />

          {/* The icon is the ONLY element that transforms on hover. Halos
              stay perfectly still. */}
          <div
            className="relative h-full w-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:scale-110"
            style={{
              filter:
                'drop-shadow(0 4px 10px hsl(var(--brand-indigo) / 0.35)) drop-shadow(0 2px 4px hsl(220 40% 2% / 0.55))',
            }}
          >
            <TechIcon name={tech} />
          </div>
        </div>

        {/* Label — bold, brightens & lifts on hover */}
        <p className="text-center text-[12px] font-bold tracking-tight text-[hsl(220_22%_88%)] transition-[transform,color] duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.04] group-hover:text-white">
          {tech}
        </p>
      </div>
    </motion.div>
  );
}
