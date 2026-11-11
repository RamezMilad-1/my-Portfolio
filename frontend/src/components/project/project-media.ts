import type { Project, ProjectMedia } from '@/lib/types';

/** Gallery items that can be shown: images and videos (PDFs are never part of a gallery). */
export const galleryMedia = (project: Project): ProjectMedia[] =>
  project.media.filter((media) => media.url && (media.kind === 'image' || media.kind === 'video'));

/** The project's cover, falling back to its first gallery image. */
export const projectCover = (project: Project): string =>
  project.coverImageUrl || project.media.find((media) => media.kind === 'image')?.url || '';
