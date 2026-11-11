'use client';

import type { ImageLoaderProps } from 'next/image';
import { cloudinaryImage } from './cloudinary';

/** `next/image` loader that lets Cloudinary resize and re-encode images at the edge. */
export function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  return cloudinaryImage(src, width, quality ?? 'auto');
}
