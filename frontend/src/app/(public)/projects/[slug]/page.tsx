import type { Metadata } from 'next';
import { ProjectDetailClient } from './project-detail-client';
import { serverApiBase } from '@/lib/server-api';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${serverApiBase()}/projects/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });

    if (res.ok) {
      const project = (await res.json()) as {
        name?: string;
        tagline?: string;
      };

      return {
        title: project.name,
        description: project.tagline,
      };
    }
  } catch {
    // Best-effort metadata when the backend is unreachable.
  }

  return { title: 'Project' };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <ProjectDetailClient slug={slug} />;
}
