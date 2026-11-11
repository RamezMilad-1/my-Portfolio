/**
 * Cloudinary delivery helpers. Uploaded images are resized and re-encoded (AVIF/WebP, automatic
 * quality) by Cloudinary's CDN, so the browser downloads only the pixels it displays.
 */

const DELIVERY_URL = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/(image|video)\/upload\/)(.+)$/;

export const isCloudinaryUrl = (url: string): boolean => DELIVERY_URL.test(url);

/** Inserts delivery transformations (e.g. `w_640`) into a Cloudinary URL; other URLs pass through. */
function withTransformations(url: string, transformations: string): string {
  const match = DELIVERY_URL.exec(url);
  return match ? `${match[1]}${transformations}/${match[3]}` : url;
}

/** An image scaled down to `width` (never up), in the best format the browser supports. */
export function cloudinaryImage(url: string, width: number, quality: number | 'auto' = 'auto') {
  return withTransformations(url, `f_auto,q_${quality},c_limit,w_${width}`);
}

/** A still frame from a Cloudinary video, used as its poster and thumbnail. */
export function cloudinaryVideoPoster(url: string, width: number): string {
  const poster = withTransformations(url, `so_0,f_auto,q_auto,c_limit,w_${width}`);
  return poster.replace(/\.[a-z0-9]+$/i, '.jpg');
}
