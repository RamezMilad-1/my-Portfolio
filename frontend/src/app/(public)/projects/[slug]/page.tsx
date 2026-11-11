import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectDetail } from '@/components/project/project-detail';
import { projectCover } from '@/components/project/project-media';
import { getProject, getProjects } from '@/lib/api/content';
import { cloudinaryImage } from '@/lib/cloudinary';

/** Published projects are pre-rendered at build time; new ones render on first visit. */
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<'/projects/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: 'Project not found' };

  const cover = projectCover(project);
  const description = project.tagline || undefined;
  const images = cover ? [{ url: cloudinaryImage(cover, 1200), alt: project.name }] : undefined;
  return {
    title: project.name,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { type: 'article', title: project.name, description, images },
    twitter: { card: 'summary_large_image', title: project.name, description, images },
  };
}

export default async function ProjectPage({ params }: PageProps<'/projects/[slug]'>) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
