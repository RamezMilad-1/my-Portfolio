import 'server-only';
import {
  type SimpleIcon,
  siDocker,
  siGit,
  siGithub,
  siJavascript,
  siMongodb,
  siNestjs,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siReact,
  siTailwindcss,
  siTypescript,
} from 'simple-icons';

/**
 * Logos in the hero's 3D cloud, as inline SVG data URIs — no network requests. A color override
 * replaces brand colors that would vanish on the dark background (Next.js and GitHub are black).
 */
const HERO_ICONS: [SimpleIcon, color?: string][] = [
  [siTypescript],
  [siJavascript],
  [siReact],
  [siNextdotjs, 'ffffff'],
  [siNodedotjs],
  [siNestjs],
  [siPostgresql],
  [siMongodb],
  [siTailwindcss],
  [siDocker],
  [siGit],
  [siGithub, 'ffffff'],
];

export const heroIconImages = HERO_ICONS.map(
  ([icon, color]) =>
    `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#${color ?? icon.hex}" d="${icon.path}"/></svg>`,
    )}`,
);
