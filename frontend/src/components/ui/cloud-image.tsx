'use client';

import Image, { type ImageProps } from 'next/image';
import { type ReactNode, useState } from 'react';
import { isCloudinaryUrl } from '@/lib/cloudinary';
import { cloudinaryLoader } from '@/lib/image-loader';

type CloudImageProps = Omit<ImageProps, 'src' | 'loader' | 'unoptimized' | 'onError'> & {
  src: string;
  /** Rendered instead of the image if it fails to load. */
  fallback?: ReactNode;
};

/**
 * `next/image` for uploaded content. Cloudinary images are resized and re-encoded by
 * Cloudinary's CDN; images from any other host load unchanged.
 */
export function CloudImage({ src, fallback = null, alt, ...props }: CloudImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return fallback;

  const fromCloudinary = isCloudinaryUrl(src);
  return (
    <Image
      src={src}
      alt={alt}
      loader={fromCloudinary ? cloudinaryLoader : undefined}
      unoptimized={!fromCloudinary}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
