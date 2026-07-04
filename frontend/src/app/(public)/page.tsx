'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  FileDown,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Send,
  Twitter,
} from 'lucide-react';
import { useProfile } from '@/lib/api/profile';
import { useProjectsPublic } from '@/lib/api/projects';
import { useCertificatesPublic } from '@/lib/api/certificates';
import { useTimelinePublic } from '@/lib/api/timeline';
import { useTechPublic } from '@/lib/api/tech';
import { Hero } from '@/components/public/hero';
import { StatusBadge } from '@/components/public/status-badge';
import { useScrollReveal } from '@/components/motion/use-scroll-reveal';
import { SectionHeading } from '@/components/public/section-heading';
import { TabsPortfolio } from '@/components/public/tabs-portfolio';
import { ProjectCardV2 } from '@/components/public/project-card-v2';
import { CertificateCard } from '@/components/public/certificate-card';
import { CertificateLightbox } from '@/components/public/certificate-lightbox';
import { TechGrid } from '@/components/public/tech-grid';
import { Timeline } from '@/components/public/timeline';
import { GradientButton } from '@/components/public/gradient-button';
import { ContactForm } from '@/components/public/contact-form';
import { Reveal } from '@/components/motion/reveal';
import { Skeleton } from '@/components/ui/skeleton';
import { uploadsUrl } from '@/lib/utils';
import { toast } from 'sonner';

type RecruiterSignal = {
  label: string;
  value: string;
};

function splitCapabilityCopy(source: string) {
  const normalized = source.trim();
  const separator = normalized.search(/:\s|\s(?:-|\u2013|\u2014)\s/);

  if (separator === -1) {
    return {
      label: 'Profile',
      value: normalized,
    };
  }

  const label = normalized.slice(0, separator).trim();
  const value = normalized
    .slice(separator)
    .replace(/^:\s*/, '')
    .replace(/^\s(?:-|\u2013|\u2014)\s*/, '')
    .trim();

  return {
    label: label || 'Profile',
    value: value || normalized,
  };
}

function recruiterSignalFromText(
  text: string | null | undefined,
): RecruiterSignal {
  return splitCapabilityCopy(typeof text === 'string' ? text : '');
}

function recruiterSignalFromFocusBlock(
  block: { heading?: string; body?: string },
): RecruiterSignal {
  const heading = block.heading?.trim();
  const body = block.body?.trim();

  return {
    label: heading || 'Profile',
    value: body || '',
  };
}

/**
 * Section heading driven purely by DB content — renders nothing when the
 * profile has no copy for the section.
 */
function DbSectionHeading({
  kicker,
  title,
  subtitle,
  variant,
}: {
  kicker?: string;
  title?: string;
  subtitle?: string;
  variant?: 'line' | 'classic';
}) {
  const k = kicker?.trim();
  const t = title?.trim();
  const s = subtitle?.trim();
  if (!k && !t && !s) return null;
  return (
    <SectionHeading
      kicker={k || undefined}
      title={t || undefined}
      subtitle={s || undefined}
      variant={variant}
    />
  );
}

export default function HomePage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: projects = [], isLoading: projectsLoading } = useProjectsPublic();
  const { data: certificates = [] } = useCertificatesPublic();
  const { data: timelineEntries = [] } = useTimelinePublic();
  const { data: techItems = [] } = useTechPublic();

  // Scroll to hash on load (e.g. arriving from /#about). Some sections
  // (e.g. #experience) only mount after async data settles, so retry briefly
  // until the element appears, then scroll once.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = window.location.hash.replace('#', '');
    if (!id) return;

    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (attempts++ < 20) {
        timer = setTimeout(tryScroll, 100);
      }
    };
    tryScroll();
    return () => clearTimeout(timer);
  }, []);

  const sortedProjects = useMemo(
    () =>
      [...projects].sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        return a.position - b.position;
      }),
    [projects],
  );

  const techList = useMemo(() => {
    if (techItems.length > 0) {
      return techItems.map((t) => t.name);
    }
    const set = new Set<string>();
    for (const p of projects) for (const t of p.tech ?? []) set.add(t);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [projects, techItems]);

  const techGridItems = useMemo(() => {
    if (techItems.length > 0) {
      return techItems.map((t) => ({ name: t.name, category: t.category }));
    }
    return techList.map((name) => ({ name }));
  }, [techItems, techList]);

  // Body paragraphs come from `profile.bio` split on blank lines.
  const aboutBodyParagraphs = useMemo<string[]>(() => {
    const bio = profile?.bio?.trim();
    if (!bio) return [];
    return bio
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [profile?.bio]);

  // CV-style rows for the compact capability snapshot.
  const aboutCapabilitiesList = useMemo<string[]>(() => {
    return (profile?.aboutCapabilities ?? [])
      .map((s) => (typeof s === 'string' ? s.trim() : ''))
      .filter(Boolean);
  }, [profile?.aboutCapabilities]);

  const aboutRecruiterSignals = useMemo<RecruiterSignal[]>(() => {
    const focusBlocks = (profile?.aboutFocusBlocks ?? [])
      .filter((block) => block?.heading?.trim() || block?.body?.trim())
      .map(recruiterSignalFromFocusBlock)
      .filter((signal) => signal.label.trim() && signal.value.trim());

    if (focusBlocks.length > 0) return focusBlocks;

    return aboutCapabilitiesList
      .map(recruiterSignalFromText)
      .filter((signal) => signal.label.trim() && signal.value.trim());
  }, [aboutCapabilitiesList, profile?.aboutFocusBlocks]);

  // Scannable fact cells for the recruiter card — only cells with DB values.
  const aboutFactCells = useMemo(
    () =>
      [
        { label: 'Education', value: profile?.education?.trim() },
        { label: 'Location', value: profile?.aboutFactLocation?.trim() },
        { label: 'Core stack', value: profile?.aboutFactStack?.trim() },
        { label: 'Available for', value: profile?.aboutFactAvailable?.trim() },
      ].filter((f): f is { label: string; value: string } => Boolean(f.value)),
    [profile],
  );

  const hasAboutSocials = Boolean(
    profile?.socials?.github ||
      profile?.socials?.linkedin ||
      profile?.socials?.x ||
      profile?.email,
  );

  const aboutLede = profile?.aboutLede?.trim() ?? '';
  const aboutDividerLabel = profile?.aboutDividerLabel?.trim() ?? '';

  const portraitName = profile?.displayName?.trim() ?? '';
  const portraitSrc = profile?.avatarUrl ? uploadsUrl(profile.avatarUrl) : null;
  const portraitInitials = portraitName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const aboutPortrait =
    portraitSrc || portraitInitials
      ? { src: portraitSrc, alt: portraitName || 'Portrait', initials: portraitInitials }
      : null;

  const [showAllProjects, setShowAllProjects] = useState(false);
  const visibleProjects = showAllProjects ? sortedProjects : sortedProjects.slice(0, 6);

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const metricsReveal = useScrollReveal<HTMLDivElement>({
    y: 16,
    margin: '-50px',
  });

  const copyEmail = async () => {
    if (!profile?.email) return;
    try {
      await navigator.clipboard.writeText(profile.email);
      toast.success('Email copied to clipboard');
    } catch {
      toast.error('Could not copy');
    }
  };

  return (
    <>
      <Hero profile={profile} />

      {/* ──────── About ──────── */}
      <section
        id="about"
        className="relative scroll-mt-20 px-4 py-10 sm:px-6 md:py-16"
      >
        <div className="mx-auto max-w-6xl">
          <DbSectionHeading
            kicker={profile?.aboutKicker}
            title={profile?.aboutTitle}
            subtitle={profile?.aboutSubtitle}
            variant="classic"
          />

          {/* Recruiter card — name + role + status + scannable facts */}
          <motion.div
            ref={metricsReveal.ref}
            initial={metricsReveal.initial}
            animate={metricsReveal.animate}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="ek-glass ek-card-sheen relative mt-14 overflow-hidden rounded-2xl p-4 sm:p-5"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--brand-violet)/0.6)] to-transparent"
            />

            {profileLoading ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                  <Skeleton className="h-7 w-72 max-w-full" />
                  <Skeleton className="h-8 w-44 rounded-full" />
                </div>
                <div
                  aria-hidden
                  className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
                />
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-28 max-w-full" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Identity line + status pill + CV */}
                {profile?.displayName ||
                profile?.aboutTagline?.trim() ||
                profile?.availability ||
                profile?.resumeUrl ? (
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                    {profile?.displayName || profile?.aboutTagline?.trim() ? (
                      <h3 className="font-display text-base font-semibold tracking-tight text-[hsl(var(--foreground))] sm:text-lg md:text-xl">
                        {profile?.displayName ?? ''}
                        {profile?.aboutTagline?.trim() ? (
                          <span className="text-[hsl(220_15%_64%)] font-normal">
                            {' '}
                            {profile.aboutTagline.trim()}
                          </span>
                        ) : null}
                      </h3>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {profile?.availability ? (
                        <StatusBadge tone="violet" label={profile.availability} />
                      ) : null}
                      {profile?.resumeUrl ? (
                        <GradientButton
                          asChild
                          variant="outline"
                          className="h-8 px-4 text-xs font-medium"
                        >
                          <a
                            href={uploadsUrl(profile.resumeUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                          >
                            <FileDown className="h-3.5 w-3.5" /> Download CV
                          </a>
                        </GradientButton>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {/* Scannable facts — Education / Location / Stack / Available for */}
                {aboutFactCells.length > 0 ? (
                  <>
                    <div
                      aria-hidden
                      className="my-4 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
                    />
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                      {aboutFactCells.map((fact) => (
                        <FactCell
                          key={fact.label}
                          label={fact.label}
                          value={fact.value}
                        />
                      ))}
                    </div>
                  </>
                ) : null}

                {/* Find me on — social trust signals */}
                {hasAboutSocials ? (
                  <>
                    <div
                      aria-hidden
                      className="my-4 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
                    />
                    <div className="flex flex-wrap items-center gap-2.5">
                      <p className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[hsl(220_15%_62%)]">
                        Find me on
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {profile?.socials?.github ? (
                          <SocialIcon
                            href={profile.socials.github}
                            label="GitHub"
                            icon={<Github className="h-4 w-4" />}
                          />
                        ) : null}
                        {profile?.socials?.linkedin ? (
                          <SocialIcon
                            href={profile.socials.linkedin}
                            label="LinkedIn"
                            icon={<Linkedin className="h-4 w-4" />}
                          />
                        ) : null}
                        {profile?.socials?.x ? (
                          <SocialIcon
                            href={profile.socials.x}
                            label="X"
                            icon={<Twitter className="h-4 w-4" />}
                          />
                        ) : null}
                        {profile?.email ? (
                          <SocialIcon
                            href={`mailto:${profile.email}`}
                            label="Email"
                            icon={<Mail className="h-4 w-4" />}
                          />
                        ) : null}
                      </div>
                    </div>
                  </>
                ) : null}
              </>
            )}
          </motion.div>

          {/* Reflective prose + portrait */}
          {aboutLede || aboutBodyParagraphs.length > 0 || aboutPortrait ? (
            <div className="mt-14 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              <Reveal x={-40} y={0} margin="-80px" className="lg:col-span-8">
                {/* Confident lede */}
                {aboutLede ? (
                  <p className="font-display text-xl font-semibold leading-[1.22] tracking-tight text-[hsl(var(--foreground))] md:text-[22px]">
                    {aboutLede}
                  </p>
                ) : null}

                {/* Reflective paragraphs */}
                {aboutBodyParagraphs.map((para, i) => (
                  <p
                    key={i}
                    className={`${
                      i === 0 && aboutLede ? 'mt-4' : i === 0 ? '' : 'mt-3'
                    } text-[13.5px] leading-relaxed text-[hsl(var(--muted-foreground))] md:text-[14.5px]`}
                  >
                    {para}
                  </p>
                ))}
              </Reveal>

              {aboutPortrait ? (
                <Reveal
                  x={40}
                  y={0}
                  delay={0.15}
                  margin="-80px"
                  className="lg:col-span-4"
                >
                  <AboutPortrait
                    src={aboutPortrait.src}
                    alt={aboutPortrait.alt}
                    initials={aboutPortrait.initials}
                  />
                </Reveal>
              ) : null}
            </div>
          ) : null}

          {/* Stylish hairline divider — bridges the bio and the CV grid */}
          {aboutDividerLabel ? <AboutDivider label={aboutDividerLabel} /> : null}

          {/* What I can ship — recruiter-facing CV snapshot */}
          {aboutRecruiterSignals.length > 0 ? (
            <Reveal y={32} margin="-60px" className="mt-6">
              <div className="relative overflow-hidden rounded-3xl bg-white/[0.03] p-7 ring-1 ring-inset ring-white/[0.06] backdrop-blur-[7px] sm:p-10">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[hsl(var(--brand-violet)/0.08)] blur-3xl"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.15] to-transparent"
                />
                <dl className="relative grid grid-cols-1 gap-x-12 gap-y-7 sm:grid-cols-2 sm:gap-y-9">
                  {aboutRecruiterSignals.map((signal, index) => (
                    <Capability
                      key={`${signal.label}-${signal.value}-${index}`}
                      signal={signal}
                    />
                  ))}
                </dl>
              </div>
            </Reveal>
          ) : null}
        </div>
      </section>

      {/* ──────── Portfolio (tabs) ──────── */}
      <section
        id="portfolio"
        className="relative scroll-mt-20 px-4 py-16 sm:px-6 md:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <DbSectionHeading
            kicker={profile?.portfolioKicker}
            title={profile?.portfolioTitle}
            subtitle={profile?.portfolioSubtitle}
          />

          <div className="mt-10">
            <TabsPortfolio
              counts={{
                projects: sortedProjects.length,
                tech: techList.length,
              }}
              projects={
                projectsLoading ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="ek-glass overflow-hidden rounded-xl"
                      >
                        <Skeleton className="aspect-[16/9] w-full rounded-none" />
                        <div className="space-y-3 p-3.5">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                          <div className="flex gap-1">
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : sortedProjects.length === 0 ? (
                  <EmptyState
                    message="No projects yet — check back soon."
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {visibleProjects.map((p, i) => (
                        <ProjectCardV2 key={p._id} project={p} index={i} />
                      ))}
                    </div>
                    {sortedProjects.length > 6 ? (
                      <div className="mt-8 flex justify-center">
                        <GradientButton
                          variant="outline"
                          onClick={() => setShowAllProjects((v) => !v)}
                        >
                          {showAllProjects
                            ? 'Show less'
                            : `View all ${sortedProjects.length} projects`}
                        </GradientButton>
                      </div>
                    ) : null}
                  </>
                )
              }
              tech={<TechGrid items={techGridItems} />}
            />
          </div>
        </div>
      </section>

      {/* ──────── Lifeline (vertical timeline + certifications) ──────── */}
      {timelineEntries.length > 0 || certificates.length > 0 ? (
        <section
          id="experience"
          className="relative scroll-mt-20 px-4 py-16 sm:px-6 md:py-24"
        >
          <div className="mx-auto max-w-3xl">
            <DbSectionHeading
              kicker={profile?.lifelineKicker}
              title={profile?.lifelineTitle}
              subtitle={profile?.lifelineSubtitle}
            />
            {timelineEntries.length > 0 ? (
              <Timeline entries={timelineEntries} />
            ) : null}

            {certificates.length > 0 ? (
              <div className="mt-16">
                <p className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(220_15%_68%)]">
                  Certifications
                </p>
                <span
                  aria-hidden
                  className="mt-3 block h-px w-12 bg-gradient-to-r from-[hsl(var(--brand-violet-soft)/0.7)] via-[hsl(var(--brand-violet-soft)/0.35)] to-transparent"
                />
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {certificates.map((c, i) => (
                    <CertificateCard
                      key={c._id}
                      certificate={c}
                      index={i}
                      onClick={() => setLightboxIdx(i)}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <CertificateLightbox
            certificates={certificates}
            index={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
            onNavigate={(i) => setLightboxIdx(i)}
          />
        </section>
      ) : null}

      {/* ──────── Contact ──────── */}
      <section
        id="contact"
        className="relative scroll-mt-20 px-4 py-16 sm:px-6 md:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <DbSectionHeading
            kicker={profile?.contactKicker}
            title={profile?.contactTitle}
            subtitle={profile?.contactSubtitle}
          />

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1fr)]">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-1">
              {profile?.email ? (
                <Reveal x={-56} y={8} delay={0} margin="-60px">
                  <ContactCard
                    icon={<Mail className="h-5 w-5" />}
                    label="Email"
                    value={profile.email}
                    href={`mailto:${profile.email}`}
                    action="Copy"
                    onAction={copyEmail}
                    note={profile.responseTime?.trim() || undefined}
                  />
                </Reveal>
              ) : null}
              {profile?.socials?.github ? (
                <Reveal x={-40} delay={0.08} margin="-60px">
                  <ContactCard
                    icon={<Github className="h-5 w-5" />}
                    label="GitHub"
                    value={profile.socials.github.replace(/^https?:\/\//, '')}
                    href={profile.socials.github}
                    external
                  />
                </Reveal>
              ) : null}
              {profile?.socials?.linkedin ? (
                <Reveal x={-48} y={-8} delay={0.16} margin="-60px">
                  <ContactCard
                    icon={<Linkedin className="h-5 w-5" />}
                    label="LinkedIn"
                    value={profile.socials.linkedin.replace(/^https?:\/\//, '')}
                    href={profile.socials.linkedin}
                    external
                  />
                </Reveal>
              ) : null}
              {profile?.socials?.x ? (
                <Reveal x={-40} delay={0.24} margin="-60px">
                  <ContactCard
                    icon={<Twitter className="h-5 w-5" />}
                    label="X / Twitter"
                    value={profile.socials.x.replace(/^https?:\/\//, '')}
                    href={profile.socials.x}
                    external
                  />
                </Reveal>
              ) : null}
              {!profile?.email &&
                !profile?.socials?.github &&
                !profile?.socials?.linkedin && (
                  <EmptyState message="Contact info coming soon." />
                )}
            </div>

            <Reveal x={48} delay={0.12} margin="-60px">
              <ContactForm />
            </Reveal>
          </div>

          {profile?.email && profile?.contactCTALabel?.trim() ? (
            <div className="mt-10 flex justify-center">
              <GradientButton asChild>
                <a href={`mailto:${profile.email}`}>
                  <Send className="h-4 w-4" />
                  {profile.contactCTALabel.trim()}
                </a>
              </GradientButton>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}

/* ────────────────────────────────────────────────────────────── */

function AboutPortrait({
  src,
  alt,
  initials,
}: {
  src: string | null;
  alt: string;
  initials: string;
}) {
  const [imgErrored, setImgErrored] = useState(false);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[11rem] sm:max-w-[13rem]">
      <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[hsl(var(--brand-indigo)/0.22)] to-[hsl(var(--brand-violet-soft)/0.22)] opacity-70 blur-2xl" />
      <div className="ek-glass relative h-full w-full overflow-hidden rounded-3xl">
        {src && !imgErrored ? (
          <Image
            src={src}
            alt={alt}
            fill
            onError={() => setImgErrored(true)}
            sizes="(min-width: 640px) 16rem, 14rem"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[hsl(var(--brand-indigo)/0.10)] to-[hsl(var(--brand-violet-soft)/0.10)]">
            <span className="font-display text-6xl font-bold tracking-tight">
              <span className="ek-gradient-text-static">{initials}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function FactCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative">
      <p className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[hsl(220_15%_62%)]">
        {label}
      </p>
      <p className="mt-1 text-[12.5px] font-medium leading-snug text-[hsl(220_25%_94%)] md:text-[13px]">
        {value}
      </p>
    </div>
  );
}

function SocialIcon({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  const isMail = href.startsWith('mailto:');
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      target={isMail ? undefined : '_blank'}
      rel={isMail ? undefined : 'noopener noreferrer'}
      className="ek-glass inline-flex h-7 w-7 items-center justify-center rounded-full text-[hsl(220_22%_88%)] transition-[transform,color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:text-white"
    >
      {icon}
    </a>
  );
}

function Capability({
  signal,
}: {
  signal: RecruiterSignal;
}) {
  return (
    <div>
      <dt className="font-display text-[15px] font-semibold tracking-tight text-[hsl(220_30%_96%)] md:text-base">
        {signal.label}
      </dt>
      <dd className="mt-1.5 text-[13.5px] leading-relaxed text-[hsl(var(--muted-foreground))] md:text-[14px]">
        {signal.value}
      </dd>
    </div>
  );
}

function AboutDivider({ label }: { label: string }) {
  return (
    <div
      className="mt-5 flex items-center justify-center gap-4"
      aria-hidden
    >
      <span className="h-px w-20 bg-gradient-to-r from-transparent to-[hsl(var(--brand-violet)/0.7)]" />
      <p className="font-display text-[10.5px] font-semibold uppercase tracking-[0.34em] text-[hsl(220_20%_74%)]">
        {label}
      </p>
      <span className="h-px w-20 bg-gradient-to-r from-[hsl(var(--brand-violet)/0.7)] to-transparent" />
    </div>
  );
}

function ContactCard({
  icon,
  label,
  value,
  href,
  external,
  action,
  onAction,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  external?: boolean;
  action?: string;
  onAction?: () => void;
  note?: string;
}) {
  return (
    <div className="group ek-glass ek-card-sheen ek-ring-conic ek-glow relative flex items-center gap-3 overflow-hidden rounded-xl p-3 transition-transform duration-300 hover:-translate-y-1">
      <div
        aria-hidden
        style={{ willChange: 'opacity' }}
        className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[hsl(var(--brand-violet)/0.10)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="ek-icon-tile relative h-9 w-9 flex-shrink-0 [&_svg]:h-4 [&_svg]:w-4">
        {icon}
      </div>
      <div className="relative min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[hsl(220_15%_68%)]">
          {label}
        </p>
        <span aria-hidden className="ek-underline mt-1" />
        <a
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          className="mt-1 block truncate text-sm font-medium text-[hsl(220_25%_94%)] transition-colors duration-300 hover:text-white"
        >
          {value}
        </a>
        {note ? (
          <p className="mt-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
            {note}
          </p>
        ) : null}
      </div>
      {action && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="relative rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-[hsl(220_25%_92%)] backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10 hover:text-white active:scale-[0.97]"
        >
          {action}
        </button>
      ) : null}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="ek-glass mx-auto max-w-md rounded-2xl p-8 text-center">
      <MapPin className="mx-auto h-8 w-8 text-[hsl(var(--brand-indigo))]" />
      <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
        {message}
      </p>
    </div>
  );
}
