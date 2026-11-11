/** Cloudinary folder that holds every portfolio upload. */
export const CLOUDINARY_FOLDER = 'portfolio';

/** Matches Cloudinary's resource types: images, videos, and raw files (PDFs). */
export const MEDIA_KINDS = ['image', 'video', 'raw'] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

const MB = 1024 * 1024;

/**
 * Accepted upload types. Size caps follow Cloudinary's free-plan limits
 * (10 MB per image or raw file, 100 MB per video).
 */
export const UPLOAD_TYPES: Record<
  string,
  { kind: MediaKind; maxBytes: number; extension?: string }
> = {
  'image/png': { kind: 'image', maxBytes: 10 * MB },
  'image/jpeg': { kind: 'image', maxBytes: 10 * MB },
  'image/webp': { kind: 'image', maxBytes: 10 * MB },
  'image/gif': { kind: 'image', maxBytes: 10 * MB },
  'image/avif': { kind: 'image', maxBytes: 10 * MB },
  'video/mp4': { kind: 'video', maxBytes: 100 * MB },
  'video/webm': { kind: 'video', maxBytes: 100 * MB },
  'video/quicktime': { kind: 'video', maxBytes: 100 * MB },
  // Raw assets keep their extension in the public id, so the delivered URL ends in `.pdf`.
  'application/pdf': { kind: 'raw', maxBytes: 10 * MB, extension: '.pdf' },
};

export const UPLOAD_MIME_TYPES = Object.keys(UPLOAD_TYPES);
