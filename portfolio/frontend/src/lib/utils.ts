import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uploadsUrl(path: string | undefined | null): string {
  if (!path) return '';
  // Already-absolute URLs (e.g. an external image) are returned untouched.
  if (/^https?:\/\//.test(path)) return path;
  // Otherwise return a SAME-ORIGIN path. A Next.js rewrite (see next.config.ts)
  // proxies `/uploads/*` to the backend. Keeping uploads same-origin lets
  // next/image optimize them (the optimizer rejects cross-origin localhost
  // URLs) so covers/avatars are served as small resized WebP instead of the
  // full-size originals.
  return path.startsWith('/') ? path : `/${path}`;
}
