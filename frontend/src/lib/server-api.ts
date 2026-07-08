// API base for SERVER-side fetches (layout, metadata, sitemap).
//
// In production the browser reaches the backend through the same-origin
// `/api/v1` proxy (see `rewrites` in next.config.ts) so the auth cookie is
// first-party — but server code can't use that relative URL, so it talks to
// the backend origin directly.
export function serverApiBase(): string {
  const origin = process.env.BACKEND_ORIGIN?.replace(/\/+$/, '');
  if (origin) return `${origin}/api/v1`;
  return process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';
}
