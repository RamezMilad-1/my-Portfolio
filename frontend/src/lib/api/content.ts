import 'server-only';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { cache } from 'react';
import type { Certificate, Profile, Project, TechItem, TimelineEntry } from '../types';

/**
 * Server-side reads of the public content. Responses are cached (ISR) and shared by every
 * visitor; the admin dashboard purges the cache after each save (see `app/api/revalidate`), and
 * the time-based revalidation below is the safety net.
 */

/** Cache tag on every content request — revalidating it refreshes the whole public site. */
export const CONTENT_TAG = 'content';
const REVALIDATE_SECONDS = 300;

/** Backend base URL for server-side requests (the browser uses the same-origin proxy instead). */
export function backendApiUrl(path: string): string {
  const origin = process.env.BACKEND_ORIGIN?.replace(/\/+$/, '');
  if (origin) return `${origin}/api/v1${path}`;
  const base = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';
  if (!base.startsWith('http')) {
    throw new Error('Set BACKEND_ORIGIN — server-side requests need an absolute backend URL.');
  }
  return `${base}${path}`;
}

const isBuild = process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;

/**
 * GET a content resource. `null` means 404. Any other failure throws, so a failed background
 * revalidation keeps serving the last good page instead of caching an empty one. Only during
 * `next build` (e.g. in CI, or while the backend is asleep) does an unreachable backend degrade
 * to `fallback`, so the build still succeeds; the page then refreshes on the next revalidation.
 */
async function getContent<T>(path: string, fallback: T): Promise<T | null> {
  try {
    const res = await fetch(backendApiUrl(path), {
      next: { revalidate: REVALIDATE_SECONDS, tags: [CONTENT_TAG] },
      signal: AbortSignal.timeout(isBuild ? 90_000 : 20_000),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GET ${path} failed with ${res.status}`);
    return (await res.json()) as T;
  } catch (error) {
    if (!isBuild) throw error;
    console.warn(`[content] ${path} unavailable during build — using empty content.`, error);
    return fallback;
  }
}

const EMPTY_PROFILE: Profile = {
  displayName: '',
  logoInitial: '',
  headline: '',
  headlines: [],
  bio: '',
  education: '',
  availability: '',
  email: '',
  avatarUrl: '',
  resumeUrl: '',
  socials: {},
  aboutKicker: '',
  aboutTitle: '',
  aboutSubtitle: '',
  portfolioKicker: '',
  portfolioTitle: '',
  portfolioSubtitle: '',
  lifelineKicker: '',
  lifelineTitle: '',
  lifelineSubtitle: '',
  contactKicker: '',
  contactTitle: '',
  contactSubtitle: '',
  aboutTagline: '',
  aboutLede: '',
  aboutFactLocation: '',
  aboutFactStack: '',
  aboutFactAvailable: '',
  aboutDividerLabel: '',
  aboutCapabilities: [],
  aboutFocusBlocks: [],
  contactCTALabel: '',
  responseTime: '',
};

// Each loader is wrapped in `cache()` so layouts, pages and metadata that need the same data in
// one render share a single request. (The abort signal opts out of fetch's own de-duplication.)

export const getProfile = cache(
  async (): Promise<Profile> => (await getContent('/profile', EMPTY_PROFILE)) ?? EMPTY_PROFILE,
);

/** Published projects, featured first. */
export const getProjects = cache(
  async (): Promise<Project[]> => (await getContent<Project[]>('/projects', [])) ?? [],
);

/** A published project, or `null` if there's none with that slug. */
export const getProject = cache((slug: string): Promise<Project | null> =>
  getContent<Project | null>(`/projects/${encodeURIComponent(slug)}`, null),
);

export const getCertificates = cache(
  async (): Promise<Certificate[]> => (await getContent<Certificate[]>('/certificates', [])) ?? [],
);

/** Published timeline entries, oldest first. */
export const getTimeline = cache(
  async (): Promise<TimelineEntry[]> => (await getContent<TimelineEntry[]>('/timeline', [])) ?? [],
);

export const getTech = cache(
  async (): Promise<TechItem[]> => (await getContent<TechItem[]>('/tech', [])) ?? [],
);
