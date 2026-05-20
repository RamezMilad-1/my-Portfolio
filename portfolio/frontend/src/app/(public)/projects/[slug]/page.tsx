'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Github,
  Sparkles,
} from 'lucide-react';
import { useProject } from '@/lib/api/projects';
import { TeamGrid } from '@/components/public/team-grid';
import { GradientButton } from '@/components/public/gradient-button';
import { SectionHeading } from '@/components/public/section-heading';
import { useScrollReveal } from '@/components/motion/use-scroll-reveal';
import { uploadsUrl } from '@/lib/utils';

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: project, isLoading, error } = useProject(slug);

  const [galleryIdx, setGalleryIdx] = useState(0);
  const [coverErrored, setCoverErrored] = useState(false);

  // Show skeleton while data is loading OR while we have neither data nor a
  // concrete error (e.g. cache-warming, hydration window).
  if (isLoading || (!project && !error)) {
    return (
      <div className="mx-auto max-w-5xl px-4 pt-28 sm:px-6">
        <div className="h-3 w-32 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
        <div className="mt-5 h-12 w-3/4 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
        <div className="mt-3 h-5 w-1/2 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
        <div className="mt-10 aspect-[16/10] w-full animate-pulse rounded-2xl bg-[hsl(var(--muted))]" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="mx-auto max-w-5xl px-4 pt-32 pb-20 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold md:text-3xl">Project not found</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          We couldn&apos;t find a project at <code>/projects/{slug}</code>.
        </p>
        <GradientButton asChild variant="outline" className="mt-6">
          <Link href="/#portfolio">
            <ArrowLeft className="h-4 w-4" /> Back to portfolio
          </Link>
        </GradientButton>
      </div>
    );
  }

  const coverFromMedia = project.media?.find((m) => m.kind === 'image')?.url;
  const cover = project.coverImageUrl
    ? uploadsUrl(project.coverImageUrl)
    : coverFromMedia
      ? uploadsUrl(coverFromMedia)
      : null;

  const galleryImages: string[] = [
    ...(project.gallery ?? []).map((u) => uploadsUrl(u)),
    ...(project.media ?? [])
      .filter((m) => m && m.kind === 'image' && m.url)
      .map((m) => uploadsUrl(m.url)),
  ].filter((u): u is string => Boolean(u));

  const showGallery = galleryImages.length > 0;
  const showCover = !showGallery && !!cover && !coverErrored;
  const safeIdx = Math.min(galleryIdx, Math.max(0, galleryImages.length - 1));

  return (
    <article className="pt-20">
      {/* ──────── Hero ──────── */}
      <section className="relative px-4 pb-10 pt-8 sm:px-6 md:pb-14 md:pt-12">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/#portfolio"
            className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--brand-indigo))]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All projects
          </Link>

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              {project.category ? (
                <span className="rounded-full border border-[hsl(var(--brand-violet-soft)/0.25)] bg-[hsl(var(--brand-violet-soft)/0.06)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--brand-indigo))]">
                  {project.category}
                </span>
              ) : null}
              {project.role ? (
                <span className="rounded-full border border-[hsl(var(--border))] px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--muted-foreground))]">
                  {project.role}
                </span>
              ) : null}
            </div>

            <h1 className="font-display mt-4 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-tight">
              <span className="ek-gradient-text">{project.name}</span>
            </h1>

            {project.tagline ? (
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-[hsl(var(--muted-foreground))] md:text-lg">
                {project.tagline}
              </p>
            ) : null}

            {project.tech?.length ? (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[hsl(var(--brand-violet-soft)/0.22)] bg-[hsl(var(--brand-violet-soft)/0.06)] px-2.5 py-0.5 text-[11px] font-medium text-[hsl(var(--brand-indigo))]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {project.liveUrl ? (
                <GradientButton asChild>
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {project.liveLabel || 'Live Demo'}
                  </a>
                </GradientButton>
              ) : null}
              {project.githubUrl ? (
                <GradientButton asChild variant="outline">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-4 w-4" />
                    {project.sourceLabel || 'Source'}
                  </a>
                </GradientButton>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ──────── Cover / Gallery ──────── */}
      {showGallery || showCover ? (
        <section className="px-4 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="ek-glass relative overflow-hidden rounded-2xl">
              <div className="relative aspect-[16/10] w-full bg-black">
                {showGallery ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={galleryImages[safeIdx]}
                    src={galleryImages[safeIdx]}
                    alt={`${project.name} screenshot ${safeIdx + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : showCover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cover!}
                    alt={project.name}
                    onError={() => setCoverErrored(true)}
                    className="h-full w-full object-cover"
                  />
                ) : null}

                {showGallery && galleryImages.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setGalleryIdx(
                          (i) =>
                            (i - 1 + galleryImages.length) % galleryImages.length,
                        )
                      }
                      aria-label="Previous"
                      className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setGalleryIdx((i) => (i + 1) % galleryImages.length)
                      }
                      aria-label="Next"
                      className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                      {galleryImages.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setGalleryIdx(i)}
                          aria-label={`Go to image ${i + 1}`}
                          className={`h-1.5 rounded-full transition-all ${
                            i === safeIdx
                              ? 'w-6 bg-white'
                              : 'w-1.5 bg-white/50 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                ) : null}
              </div>

              {showGallery && galleryImages.length > 1 ? (
                <div className="flex gap-2 overflow-x-auto p-3">
                  {galleryImages.map((src, i) => (
                    <button
                      key={`${src}-${i}`}
                      type="button"
                      onClick={() => setGalleryIdx(i)}
                      className={`relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-md transition-all ${
                        i === safeIdx
                          ? 'ring-2 ring-[hsl(var(--brand-indigo))]'
                          : 'opacity-55 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* ──────── Body ──────── */}
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 md:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-8">
            {project.problem || project.outcome || project.role ? (
              <div>
                <SectionHeading centered={false} kicker="01" title="Case study" />
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {project.problem ? (
                    <CaseStudyCard label="Problem" body={project.problem} />
                  ) : null}
                  {project.role ? (
                    <CaseStudyCard label="My role" body={project.role} />
                  ) : null}
                  {project.outcome ? (
                    <CaseStudyCard
                      label="Outcome"
                      body={project.outcome}
                      className={
                        project.problem || project.role ? '' : 'sm:col-span-2'
                      }
                    />
                  ) : null}
                </div>
              </div>
            ) : null}

            {project.description ? (
              <div>
                <SectionHeading centered={false} kicker="02" title="About" />
                <div className="prose-soft mt-5 max-w-none text-sm md:text-base">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {project.description}
                  </ReactMarkdown>
                </div>
              </div>
            ) : null}

            {project.architecture ? (
              <div>
                <SectionHeading
                  centered={false}
                  kicker="03"
                  title="Architecture"
                />
                <div className="prose-soft mt-5 max-w-none text-sm md:text-base">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {project.architecture}
                  </ReactMarkdown>
                </div>
              </div>
            ) : null}

            {project.highlights?.length ? (
              <div>
                <SectionHeading
                  centered={false}
                  kicker="04"
                  title="Key highlights"
                />
                <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {project.highlights.map((h, i) => (
                    <HighlightItem key={`${h}-${i}`} text={h} index={i} />
                  ))}
                </ul>
              </div>
            ) : null}

            {project.features?.length ? (
              <div>
                <SectionHeading centered={false} kicker="05" title="Features" />
                <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {project.features.map((f, i) => (
                    <FeatureItem key={`${f}-${i}`} text={f} index={i} />
                  ))}
                </ul>
              </div>
            ) : null}

            {project.team?.length ? (
              <div>
                <SectionHeading
                  centered={false}
                  kicker="06"
                  title="Collaborators"
                />
                <div className="mt-6">
                  <TeamGrid team={project.team} />
                </div>
              </div>
            ) : null}
          </div>

          <aside className="lg:col-span-4">
            <div className="ek-glass sticky top-24 space-y-4 rounded-2xl p-5">
              {project.liveUrl ? (
                <GradientButton asChild className="w-full">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {project.liveLabel || 'Live Demo'}
                  </a>
                </GradientButton>
              ) : null}
              {project.githubUrl ? (
                <GradientButton
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-4 w-4" />
                    {project.sourceLabel || 'Source'}
                  </a>
                </GradientButton>
              ) : null}

              <dl className="space-y-3.5 border-t border-[hsl(var(--border))] pt-4 text-sm">
                {project.role ? (
                  <DetailRow label="Role" value={project.role} />
                ) : null}
                {project.category ? (
                  <DetailRow label="Category" value={project.category} />
                ) : null}
                {project.tech?.length ? (
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
                      Stack
                    </dt>
                    <dd className="mt-2 flex flex-wrap gap-1">
                      {project.tech.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-[hsl(var(--brand-violet-soft)/0.20)] bg-[hsl(var(--brand-violet-soft)/0.05)] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--brand-indigo))]"
                        >
                          {t}
                        </span>
                      ))}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </aside>
        </div>
      </div>

      {/* ──────── back CTA ──────── */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="ek-glass flex flex-col items-start gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--brand-violet-soft))]">
              Keep exploring
            </p>
            <h3 className="font-display mt-1.5 text-xl font-semibold tracking-tight md:text-2xl">
              See all projects
            </h3>
          </div>
          <GradientButton asChild>
            <Link href="/#portfolio">
              Back to portfolio <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          </GradientButton>
        </div>
      </section>
    </article>
  );
}

function HighlightItem({ text, index }: { text: string; index: number }) {
  const { ref, initial, animate } = useScrollReveal<HTMLLIElement>({
    y: 10,
    margin: '-40px',
  });
  return (
    <motion.li
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{ delay: index * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="ek-glass flex items-start gap-3 rounded-xl p-3.5"
    >
      <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--brand-indigo))] to-[hsl(var(--brand-violet-soft))] text-white">
        <Sparkles className="h-3 w-3" />
      </span>
      <span className="text-sm text-[hsl(var(--foreground))]">{text}</span>
    </motion.li>
  );
}

function FeatureItem({ text, index }: { text: string; index: number }) {
  const { ref, initial, animate } = useScrollReveal<HTMLLIElement>({
    y: 10,
    margin: '-40px',
  });
  return (
    <motion.li
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{ delay: index * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="ek-glass flex items-start gap-3 rounded-xl p-3.5"
    >
      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand-violet-soft)/0.14)] text-[hsl(var(--brand-indigo))]">
        <Check className="h-3 w-3" />
      </span>
      <span className="text-sm text-[hsl(var(--foreground))]">{text}</span>
    </motion.li>
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
    <div className={`ek-glass rounded-xl p-4 ${className}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--brand-violet-soft))]">
        {label}
      </p>
      <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-[hsl(var(--foreground))]">
        {body}
      </p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
        {label}
      </dt>
      <dd className="mt-1 text-[hsl(var(--foreground))]">{value}</dd>
    </div>
  );
}
