import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { GalleryItem } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Gallery entries were historically plain URL strings; newer documents store
// { url, title } objects. Normalize both shapes for display and editing.
export function normalizeGalleryItem(
  entry: string | GalleryItem,
): { url: string; title: string } {
  return typeof entry === 'string'
    ? { url: entry, title: '' }
    : { url: entry.url, title: entry.title ?? '' };
}
