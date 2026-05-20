import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  ).replace(/\/$/, '');

  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
  ];

  // Best-effort project URLs — silently fall back if the backend isn't reachable
  // at build/request time so the sitemap is never broken.
  try {
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';
    const res = await fetch(`${apiBase}/projects`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const projects = (await res.json()) as Array<{
        slug: string;
        updatedAt?: string;
      }>;
      for (const p of projects) {
        staticEntries.push({
          url: `${base}/projects/${p.slug}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      }
    }
  } catch {
    // ignore
  }

  return staticEntries;
}
