import type { MetadataRoute } from 'next';
import { getProfile, getProjects } from '@/lib/api/content';
import { SITE_URL } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [profile, projects] = await Promise.all([getProfile(), getProjects()]);
  const updated = [profile.updatedAt, ...projects.map((project) => project.updatedAt)]
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1);

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: updated ? new Date(updated) : undefined,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...projects.map((project) => ({
      url: `${SITE_URL}/projects/${project.slug}`,
      lastModified: new Date(project.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
