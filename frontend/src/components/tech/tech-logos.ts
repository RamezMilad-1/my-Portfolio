/**
 * Logo lookup for tech names typed in the admin. Multicolor logos come from Devicon
 * (https://devicon.dev); techs Devicon doesn't carry fall back to Simple Icons, and anything
 * unknown shows its initial.
 */

/** Normalized name → [Devicon slug, variant]. */
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

  // frontend frameworks and libraries
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

  // backend and runtimes
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

  // cloud, hosting, devops
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

  // data and ML
  pandas: ['pandas', 'original'],
  numpy: ['numpy', 'original'],
  tensorflow: ['tensorflow', 'original'],
  pytorch: ['pytorch', 'original'],
  jupyter: ['jupyter', 'original'],

  // mobile
  flutter: ['flutter', 'original'],
  ionic: ['ionic', 'original'],
};

/** Logos whose brand color is near-black and would vanish on the dark background. */
const OVERRIDES: Record<string, string> = {
  next: 'https://cdn.simpleicons.org/nextdotjs/ffffff',
  'next.js': 'https://cdn.simpleicons.org/nextdotjs/ffffff',
  nextjs: 'https://cdn.simpleicons.org/nextdotjs/ffffff',
};

/** Normalized name → Simple Icons slug (rendered in the brand color). */
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

/** Exact lowercase name first, then with punctuation and spaces stripped. */
function lookup<T>(table: Record<string, T>, name: string): T | undefined {
  const key = name.toLowerCase().trim();
  return table[key] ?? table[key.replace(/[^a-z0-9]/g, '')];
}

/** Candidate logo URLs for a tech name, best first. Empty when no logo is known. */
export function techLogoSources(name: string): string[] {
  const sources: string[] = [];
  const override = lookup(OVERRIDES, name);
  const devicon = lookup(DEVICON, name);
  const simpleIcon = lookup(SIMPLE_ICONS, name);
  if (override) sources.push(override);
  else if (devicon) {
    const [slug, variant] = devicon;
    sources.push(
      `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-${variant}.svg`,
    );
  }
  if (simpleIcon) sources.push(`https://cdn.simpleicons.org/${simpleIcon}`);
  return sources;
}
