/** Absolute URL of the public site, without a trailing slash. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

/**
 * Only same-site paths are allowed as post-login destinations, so `/login?next=https://evil.com`
 * can't be used to bounce a freshly signed-in admin to another site.
 */
export function safeRedirectPath(next: string | null | undefined, fallback = '/admin'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return fallback;
  }
  return next;
}
