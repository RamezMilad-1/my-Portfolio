'use client';

import { use, useRef } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Github } from 'lucide-react';
import { useProject } from '@/lib/api/projects';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { Magnetic } from '@/components/motion/magnetic';
import { MediaGallery } from '@/components/public/media-gallery';
import { TeamGrid } from '@/components/public/team-grid';
import { uploadsUrl } from '@/lib/utils';

export default function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: project, isLoading, error } = useProject(slug);
  const heroRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReduced ? '0%' : '20%']);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, prefersReduced ? 1 : 1.06]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="h-3 w-32 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
        <div className="mt-6 h-16 w-3/4 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
        <div className="mt-4 h-6 w-1/2 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
        <div className="mt-8 flex gap-2">
          <div className="h-7 w-20 animate-pulse rounded-full bg-[hsl(var(--muted))]" />
          <div className="h-7 w-24 animate-pulse rounded-full bg-[hsl(var(--muted))]" />
          <div className="h-7 w-16 animate-pulse rounded-full bg-[hsl(var(--muted))]" />
        </div>
        <div className="mt-12 aspect-[16/9] w-full animate-pulse rounded-[28px] bg-[hsl(var(--muted))]" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl font-semibold">Project not found</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          We couldn&apos;t find a project at <code>/projects/{slug}</code>.
        </p>
        <Button asChild variant="outline" className="mt-6 rounded-full">
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" /> Back to projects
          </Link>
        </Button>
      </div>
    );
  }

  const cover =
    project.coverImageUrl
      ? uploadsUrl(project.coverImageUrl)
      : project.media?.find((m) => m.kind === 'image')?.url
        ? uploadsUrl(project.media.find((m) => m.kind === 'image')!.url)
        : null;

  return (
    <article>
      {/* Hero banner with parallax cover */}
      <section
        ref={heroRef}
        className="aurora relative overflow-hidden border-b border-[hsl(var(--border))]"
      >
        <div className="noise pointer-events-none absolute inset-0" />
        <motion.div
          style={{ y: heroY, scale: heroScale }}
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-30"
        >
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : null}
        </motion.div>

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 md:pb-28 md:pt-16">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All projects
          </Link>

          <Reveal className="mt-8">
            {project.role ? (
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
                {project.role}
              </p>
            ) : null}
            <h1 className="font-display mt-3 text-5xl font-semibold leading-[1.04] tracking-tight md:text-7xl">
              {project.name}
            </h1>
            {project.tagline ? (
              <p className="mt-5 max-w-3xl text-lg text-[hsl(var(--muted-foreground))] md:text-xl">
                {project.tagline}
              </p>
            ) : null}
            <div className="mt-7 flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
                <Badge key={t} variant="outline" className="rounded-full">
                  {t}
                </Badge>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {project.liveUrl ? (
                <Magnetic>
                  <Button asChild size="lg" className="rounded-full px-7 shadow-lg">
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open project
                    </a>
                  </Button>
                </Magnetic>
              ) : null}
              {project.githubUrl ? (
                <Button asChild variant="outline" size="lg" className="rounded-full px-6">
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                    Source
                  </a>
                </Button>
              ) : null}
              {!project.liveUrl && project.githubUrl ? (
                <span className="rounded-full border border-dashed border-[hsl(var(--border))] px-3 py-1 text-xs text-[hsl(var(--muted-foreground))]">
                  Source available — live demo not currently hosted
                </span>
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Cover image */}
      {cover ? (
        <Reveal className="mx-auto -mt-10 max-w-6xl px-4 sm:px-6">
          <div className="ring-lift overflow-hidden rounded-[28px] border border-[hsl(var(--border))]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt={project.name} className="aspect-[16/9] w-full object-cover" />
          </div>
        </Reveal>
      ) : null}

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="space-y-16 lg:col-span-8">
            {project.problem || project.outcome || project.role || project.architecture ? (
              <Reveal>
                <SectionHeading num="01" title="Case study" />
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {project.problem ? (
                    <CaseStudyCard label="Problem" body={project.problem} />
                  ) : null}
                  {project.role ? (
                    <CaseStudyCard label="My contribution" body={project.role} />
                  ) : null}
                  {project.outcome ? (
                    <CaseStudyCard
                      label="Outcome"
                      body={project.outcome}
                      className={project.problem || project.role ? '' : 'sm:col-span-2'}
                    />
                  ) : null}
                </div>
              </Reveal>
            ) : null}

            {project.description ? (
              <Reveal>
                <SectionHeading num="02" title="About" />
                <div className="prose-soft mt-6 max-w-none text-base md:text-lg">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {project.description}
                  </ReactMarkdown>
                </div>
              </Reveal>
            ) : null}

            {project.architecture ? (
              <Reveal>
                <SectionHeading num="03" title="Architecture" />
                <div className="prose-soft mt-6 max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {project.architecture}
                  </ReactMarkdown>
                </div>
              </Reveal>
            ) : null}

            {project.features?.length ? (
              <Reveal>
                <SectionHeading num="04" title="Features" />
                <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {project.features.map((f, i) => (
                    <motion.li
                      key={f}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04, duration: 0.4 }}
                      className="group flex items-start gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-colors hover:border-[hsl(var(--accent))]/40"
                    >
                      <span className="mt-1.5 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-[hsl(var(--accent))]" />
                      <span className="text-sm text-[hsl(var(--foreground))]">{f}</span>
                    </motion.li>
                  ))}
                </ul>
              </Reveal>
            ) : null}

            {project.media?.length ? (
              <Reveal>
                <SectionHeading num="05" title="Media" />
                <div className="mt-6">
                  <MediaGallery media={project.media} />
                </div>
              </Reveal>
            ) : null}

            {project.team?.length ? (
              <Reveal>
                <SectionHeading num="06" title="Collaborators" />
                <div className="mt-6">
                  <TeamGrid team={project.team} />
                </div>
              </Reveal>
            ) : null}
          </div>

          <aside className="lg:col-span-4">
            <Reveal delay={0.1}>
              <div className="sticky top-24 space-y-5 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
                {project.liveUrl ? (
                  <Button
                    asChild
                    className="w-full rounded-full shadow-[0_8px_24px_-8px_hsl(var(--accent)/0.5)]"
                  >
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Open project
                    </a>
                  </Button>
                ) : null}
                {project.githubUrl ? (
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                      Source on GitHub
                    </a>
                  </Button>
                ) : null}

                <dl className="space-y-4 border-t border-[hsl(var(--border))] pt-5 text-sm">
                  {project.role ? (
                    <DetailRow label="Role" value={project.role} />
                  ) : null}
                  {project.tech?.length ? (
                    <div>
                      <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
                        Stack
                      </dt>
                      <dd className="mt-2 flex flex-wrap gap-1">
                        {project.tech.map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="rounded-full text-[10px]"
                          >
                            {t}
                          </Badge>
                        ))}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </Reveal>
          </aside>
        </div>
      </div>

      {/* footer CTA back to projects */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="flex flex-col items-start gap-4 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
                Keep exploring
              </p>
              <h3 className="font-display mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                More projects
              </h3>
            </div>
            <Button asChild className="rounded-full" size="lg">
              <Link href="/projects">
                Back to all <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </article>
  );
}

function SectionHeading({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="font-mono text-xs text-[hsl(var(--muted-foreground))]">{num}</span>
      <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h2>
    </div>
  );
}

function CaseStudyCard({
  label,
  body,
  className = '',
}: {
  label: string;
  body: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 ${className}`}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
        {label}
      </p>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[hsl(var(--foreground))]">
        {body}
      </p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
        {label}
      </dt>
      <dd className="mt-1 text-[hsl(var(--foreground))]">{value}</dd>
    </div>
  );
}
