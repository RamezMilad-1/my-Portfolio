'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Github,
  Sparkles,
  X,
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
  const [direction, setDirection] = useState(0);
  const [coverErrored, setCoverErrored] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const prefersReduced = useReducedMotion();

  // Right-rail height-aware sticky: pin the rail's bottom 24 px above the
  // viewport bottom ONCE the rail is fully visible, then freeze it there
  // while the left column scrolls past. Both columns end together because
  // the rail is sticky inside the same grid cell as the (taller) left.
  //
  // We use a CALLBACK ref (not useRef) so the effect re-runs the moment
  // the rail element actually mounts. The first render shows a skeleton
  // (the rail JSX isn't in the tree yet), so a plain useRef + [] effect
  // would observe `null` and never re-attach — leaving railHeight at 0
  // and the sticky math pinning the rail to the viewport bottom forever.
  const [railEl, setRailEl] = useState<HTMLDivElement | null>(null);
  const [railHeight, setRailHeight] = useState(0);
  useEffect(() => {
    if (!railEl || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height ?? 0;
      setRailHeight(h);
    });
    ro.observe(railEl);
    return () => ro.disconnect();
  }, [railEl]);

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

  const goTo = (next: number) => {
    const len = galleryImages.length;
    if (len === 0) return;
    const normalized = ((next % len) + len) % len;
    setDirection(normalized === safeIdx ? 0 : normalized > safeIdx ? 1 : -1);
    setGalleryIdx(normalized);
  };

  // Reduced motion: pure crossfade, no x translation, no spring.
  const slideVariants = prefersReduced
    ? {
        enter: () => ({ opacity: 0 }),
        center: { opacity: 1 },
        exit: () => ({ opacity: 0 }),
      }
    : {
        enter: (dir: number) => ({ x: dir > 0 ? 28 : dir < 0 ? -28 : 0, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -28 : dir < 0 ? 28 : 0, opacity: 0 }),
      };

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
            {/* Kicker — short gradient line + label, "magazine masthead" feel */}
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="h-[2px] w-10 rounded-full bg-gradient-to-r from-[hsl(var(--brand-indigo))] to-[hsl(var(--brand-violet))] shadow-[0_0_10px_-2px_hsl(var(--brand-violet)/0.55)]"
              />
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[hsl(var(--brand-violet-soft))]">
                {project.category ? `Project · ${project.category}` : 'Project'}
              </span>
            </div>

            <h1 className="font-display mt-3 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-tight">
              <span className="ek-gradient-text">{project.name}</span>
            </h1>

            {/* Iconic underline — gradient bar that fades, with a glowing endcap dot */}
            <div className="relative mt-4 flex items-center gap-2">
              <span
                aria-hidden
                className="h-[3px] w-40 rounded-full bg-gradient-to-r from-[hsl(var(--brand-indigo))] via-[hsl(var(--brand-violet))] to-transparent shadow-[0_0_14px_-2px_hsl(var(--brand-violet)/0.55)]"
              />
              <span
                aria-hidden
                className="-ml-2 h-2 w-2 rounded-full bg-[hsl(var(--brand-violet))] shadow-[0_0_12px_2px_hsl(var(--brand-violet)/0.55)]"
              />
              {project.role ? (
                <span className="ml-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--muted-foreground))]">
                  {project.role}
                </span>
              ) : null}
            </div>

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
                    className="rounded-full border border-[hsl(var(--brand-violet-soft)/0.28)] bg-[hsl(var(--brand-violet-soft)/0.07)] px-2.5 py-0.5 text-[11px] font-medium text-[hsl(var(--brand-violet-soft))] shadow-[inset_0_1px_0_hsl(0_0%_100%/0.06)]"
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

      {/* ──────── Body ──────── */}
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 md:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="order-2 space-y-12 lg:order-1 lg:col-span-8">
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

          <aside className="order-1 lg:order-2 lg:col-span-4">
            <div
              ref={setRailEl}
              className="space-y-5"
              style={{
                position: 'sticky',
                // Engage sticky only when the rail's bottom would otherwise
                // go below `viewport - 24`. Until then the rail scrolls with
                // the page. `dvh` for mobile toolbar safety; `max(24px, …)`
                // falls back to top-pin if the rail ever exceeds viewport.
                top: `max(24px, calc(100dvh - ${railHeight}px - 24px))`,
              }}
            >
              {/* Gallery — same logic, now in the site's dark-glass language
                  so it sits as a peer of the info card below and the cards
                  on the left. */}
              {showGallery || showCover ? (
                <div className="relative">
                  {/* Soft ambient violet halo — tighter so it doesn't bleed
                      into the info card below. */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(55%_50%_at_50%_45%,hsl(var(--brand-violet-soft)/0.18),transparent_75%)] blur-3xl"
                  />

                  {/* Dark glass shell — same family as .ek-glass cards.
                      No `ek-card-sheen` here: its ::after overlay paints a
                      whitish gradient on top of the image (opacity 0.85)
                      and visibly washes the screenshot out. */}
                  <div className="ek-glass ek-glow relative overflow-hidden rounded-2xl">
                    {/* Image stage. */}
                    <div
                      className="relative aspect-[16/10] w-full overflow-hidden"
                      style={{
                        background:
                          'radial-gradient(120% 80% at 50% 0%, hsl(0 0% 100% / 0.06), transparent 60%), linear-gradient(180deg, hsl(232 28% 12% / 0.55), hsl(232 28% 8% / 0.65))',
                      }}
                    >
                      {showGallery ? (
                        <AnimatePresence initial={false} custom={direction} mode="sync">
                          <motion.img
                            key={galleryImages[safeIdx]}
                            src={galleryImages[safeIdx]}
                            alt={`${project.name} screenshot ${safeIdx + 1}`}
                            onClick={() => setLightboxOpen(true)}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={
                              prefersReduced
                                ? { opacity: { duration: 0.2 } }
                                : {
                                    x: { type: 'spring', stiffness: 240, damping: 32 },
                                    opacity: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
                                  }
                            }
                            className="absolute inset-0 h-full w-full cursor-zoom-in object-contain drop-shadow-[0_14px_24px_hsl(220_40%_2%/0.35)]"
                          />
                        </AnimatePresence>
                      ) : showCover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover!}
                          alt={project.name}
                          onClick={() => setLightboxOpen(true)}
                          onError={() => setCoverErrored(true)}
                          className="absolute inset-0 h-full w-full cursor-zoom-in object-contain drop-shadow-[0_14px_24px_hsl(220_40%_2%/0.35)]"
                        />
                      ) : null}

                      {/* Subtle top-edge sheen, matching ek-card-sheen tier. */}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
                      />

                      {showGallery && galleryImages.length > 1 ? (
                        <>
                          <button
                            type="button"
                            onClick={() => goTo(safeIdx - 1)}
                            aria-label="Previous"
                            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[hsl(220_30%_8%/0.55)] text-white shadow-[0_6px_18px_-8px_hsl(220_40%_4%/0.6)] backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-white/30 hover:bg-[hsl(220_30%_14%/0.75)] hover:text-[hsl(var(--brand-violet-soft))]"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => goTo(safeIdx + 1)}
                            aria-label="Next"
                            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[hsl(220_30%_8%/0.55)] text-white shadow-[0_6px_18px_-8px_hsl(220_40%_4%/0.6)] backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-white/30 hover:bg-[hsl(220_30%_14%/0.75)] hover:text-[hsl(var(--brand-violet-soft))]"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/15 bg-[hsl(220_30%_8%/0.55)] px-2.5 py-1.5 shadow-[0_6px_18px_-8px_hsl(220_40%_4%/0.6)] backdrop-blur-md">
                            {galleryImages.map((_, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => goTo(i)}
                                aria-label={`Go to image ${i + 1}`}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  i === safeIdx
                                    ? 'w-6 bg-gradient-to-r from-[hsl(var(--brand-indigo))] to-[hsl(var(--brand-violet))] shadow-[0_0_10px_-1px_hsl(var(--brand-violet)/0.55)]'
                                    : 'w-1.5 bg-[hsl(220_15%_70%/0.30)] hover:bg-[hsl(220_15%_85%/0.45)]'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      ) : null}
                    </div>

                    {/* Bottom film strip — only when gallery has >1 image. */}
                    {showGallery && galleryImages.length > 1 ? (
                      <div className="relative border-t border-white/[0.08] bg-[hsl(232_28%_10%/0.45)] px-3 py-2.5 backdrop-blur-md">
                        {/* Counter on the right — dark capsule */}
                        <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-full border border-white/10 bg-[hsl(220_30%_8%/0.55)] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[hsl(220_25%_90%)] backdrop-blur sm:flex">
                          <span className="text-[hsl(var(--brand-violet-soft))]">
                            {safeIdx + 1}
                          </span>
                          <span className="text-[hsl(220_15%_55%)]">/</span>
                          <span>{galleryImages.length}</span>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pr-0 sm:pr-14">
                          {galleryImages.map((src, i) => (
                            <motion.button
                              key={`${src}-${i}`}
                              type="button"
                              onClick={() => goTo(i)}
                              whileHover={{ y: -2 }}
                              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                              className={`relative h-11 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-[hsl(220_30%_10%/0.45)] backdrop-blur transition-all duration-300 ${
                                i === safeIdx
                                  ? 'border-[hsl(var(--brand-indigo)/0.65)] opacity-100 shadow-[0_0_0_1px_hsl(var(--brand-indigo)/0.30),0_6px_14px_-6px_hsl(var(--brand-violet)/0.45)]'
                                  : 'border-white/10 opacity-65 hover:border-white/25 hover:opacity-100'
                              }`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={src}
                                alt=""
                                className="h-full w-full object-contain p-0.5"
                              />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Project metadata */}
              <div className="ek-glass space-y-4 rounded-2xl p-5">
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

      {/* ──────── Image lightbox ──────── */}
      <ImageLightbox
        open={lightboxOpen}
        images={showGallery ? galleryImages : cover ? [cover] : []}
        index={showGallery ? safeIdx : 0}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(i) => goTo(i)}
        alt={project.name}
      />
    </article>
  );
}

function ImageLightbox({
  open,
  images,
  index,
  onClose,
  onNavigate,
  alt,
}: {
  open: boolean;
  images: string[];
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
  alt: string;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && images.length > 1) {
        onNavigate((index + 1) % images.length);
      }
      if (e.key === 'ArrowLeft' && images.length > 1) {
        onNavigate((index - 1 + images.length) % images.length);
      }
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, index, images.length, onClose, onNavigate]);

  const src = images[index];

  return (
    <AnimatePresence>
      {open && src ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md sm:p-8"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate((index - 1 + images.length) % images.length);
                }}
                aria-label="Previous"
                className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 sm:left-6"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate((index + 1) % images.length);
                }}
                aria-label="Next"
                className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 sm:right-6"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                {index + 1} / {images.length}
              </div>
            </>
          ) : null}

          <AnimatePresence mode="wait">
            <motion.img
              key={src}
              src={src}
              alt={alt}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] max-w-[92vw] cursor-zoom-out rounded-xl object-contain shadow-[0_30px_80px_-20px_hsl(220_40%_2%/0.8)]"
            />
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
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
