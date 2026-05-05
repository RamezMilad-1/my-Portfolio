import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uploadsUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_UPLOADS_BASE ?? 'http://localhost:3001';
  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
}
