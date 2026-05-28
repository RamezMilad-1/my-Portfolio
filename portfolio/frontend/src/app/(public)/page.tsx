'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
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
import { uploadsUrl } from '@/lib/utils';
import { toast } from 'sonner';

export default function HomePage() {
  const { data: profile } = useProfile();
  const { data: projects = [] } = useProjectsPublic();
  const { data: certificates = [] } = useCertificatesPublic();
  const { data: timelineEntries = [] } = useTimelinePublic();
  const { data: techItems = [] } = useTechPublic();

  // Scroll to hash on load (e.g. arriving from /#about). Some sections
  // (e.g. #lifeline) only mount after async data settles, so retry briefly
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
    // If admin has curated a tech list, use that (in their ordering).
    // Otherwise auto-derive from project tech arrays (legacy behaviour).
    if (techItems.length > 0) {
      return techItems.map((t) => t.name);
    }
    const set = new Set<string>();
    for (const p of projects) for (const t of p.tech ?? []) set.add(t);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [projects, techItems]);

  const stats = useMemo(() => {
    const userStats = profile?.stats ?? {};
    return {
      projectsShipped:
        userStats.projectsShipped ?? projects.filter((p) => p.status === 'published').length,
      technologies: userStats.technologies ?? techList.length,
      yearsCoding: userStats.yearsCoding ?? 3,
    };
  }, [profile, projects, techList]);

  // Body paragraphs come from `profile.bio` split on blank lines. When the
  // bio is empty, fall back to the two-paragraph default that ships with the
  // site so the layout stays meaningful out of the box.
  const aboutBodyParagraphs = useMemo<string[]>(() => {
    const bio = profile?.bio?.trim();
    if (bio) {
      return bio
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
    }
    return [
      'Most of my time goes into TypeScript: React or Next.js on the front, NestJS on the back, MongoDB or Postgres underneath. I care about the parts most people skip — micro-interactions that feel right, types that hold the system together, and code that still reads cleanly when I come back to it cold.',
      "I'm at the stage where I want to push past student projects into real work — full-stack TypeScript, shipped end-to-end, and honest about what's done versus what I'd refactor if I had another day.",
    ];
  }, [profile?.bio]);

  // Same pattern for the "What I can ship" capability bullets.
  const aboutCapabilitiesList = useMemo<string[]>(() => {
    const items = (profile?.aboutCapabilities ?? [])
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length > 0) return items;
    return [
      'Full-stack apps from Figma to deploy — typed APIs, accessible UIs, clean builds.',
      'Production React / Next.js frontends with motion, dark mode, and a11y baked in.',
      'Strict NestJS backends — validation, auth, and clean module boundaries.',
      'Real data layers — MongoDB or Postgres — with proper schemas, not just CRUD.',
    ];
  }, [profile?.aboutCapabilities]);

  const [showAllProjects, setShowAllProjects] = useState(false);
  const visibleProjects = showAllProjects ? sortedProjects : sortedProjects.slice(0, 6);

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const aboutTextReveal = useScrollReveal<HTMLDivElement>({
    x: -40,
    y: 0,
    margin: '-80px',
  });
  const aboutPortraitReveal = useScrollReveal<HTMLDivElement>({
    x: 40,
    y: 0,
    margin: '-80px',
  });
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
          <SectionHeading
            kicker={profile?.aboutKicker?.trim() || 'About'}
            title={profile?.aboutTitle?.trim() || 'The short version.'}
            subtitle={profile?.aboutSubtitle?.trim() || undefined}
          />

          {/* Recruiter card — name + role + status + scannable facts */}
          <motion.div
            ref={metricsReveal.ref}
            initial={metricsReveal.initial}
            animate={metricsReveal.animate}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="ek-glass ek-card-sheen relative mt-10 overflow-hidden rounded-2xl p-4 sm:p-5"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--brand-violet)/0.6)] to-transparent"
            />

            {/* Identity line + status pill */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <h3 className="font-display text-base font-semibold tracking-tight text-[hsl(var(--foreground))] sm:text-lg md:text-xl">
                {profile?.displayName ?? 'Ramez Milad'}
                <span className="text-[hsl(220_15%_64%)] font-normal">
                  {' '}
                  {profile?.aboutTagline?.trim() ||
                    '— Full-stack TypeScript developer'}
                </span>
              </h3>
              <StatusBadge
                tone="violet"
                label={
                  profile?.availability ??
                  'Open to internships · Cairo / remote'
                }
              />
            </div>

            {/* Hairline */}
            <div
              aria-hidden
              className="my-4 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
            />

            {/* Scannable facts — Role / Location / Stack / Available for */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
              <FactCell
                label="Role"
                value={
                  profile?.education ?? '3rd-year CS · Software Engineering'
                }
              />
              <FactCell
                label="Location"
                value={
                  profile?.aboutFactLocation?.trim() ||
                  'Cairo, Egypt · GMT+2'
                }
              />
              <FactCell
                label="Core stack"
                value={
                  profile?.aboutFactStack?.trim() ||
                  'TypeScript · React · Next.js · NestJS'
                }
              />
              <FactCell
                label="Available for"
                value={
                  profile?.aboutFactAvailable?.trim() ||
                  'Internships · Junior · Remote'
                }
              />
            </div>

            {/* Find me on — social trust signals */}
            {profile?.socials?.github ||
            profile?.socials?.linkedin ||
            profile?.socials?.x ||
            profile?.email ? (
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
          </motion.div>

          {/* Reflective prose + portrait */}
          <div className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <motion.div
              ref={aboutTextReveal.ref}
              initial={aboutTextReveal.initial}
              animate={aboutTextReveal.animate}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-8"
            >
              {/* Confident lede */}
              <p className="font-display text-xl font-semibold leading-[1.22] tracking-tight text-[hsl(var(--foreground))] md:text-[22px]">
                {profile?.aboutLede?.trim() ||
                  'I build production-grade web apps end-to-end — typed all the way through, with the kind of detail that holds up six months later.'}
              </p>

              {/* Reflective paragraphs */}
              {aboutBodyParagraphs.map((para, i) => (
                <p
                  key={i}
                  className={`${
                    i === 0 ? 'mt-4' : 'mt-3'
                  } text-[13.5px] leading-relaxed text-[hsl(var(--muted-foreground))] md:text-[14.5px]`}
                >
                  {para}
                </p>
              ))}

              {/* CTAs */}
              <div className="mt-5 flex flex-wrap gap-2.5">
                <GradientButton asChild>
                  <a
                    href="#portfolio"
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById('portfolio')
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    See my work <ArrowRight className="h-4 w-4" />
                  </a>
                </GradientButton>
                {profile?.resumeUrl ? (
                  <GradientButton asChild variant="outline">
                    <a
                      href={uploadsUrl(profile.resumeUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      <FileDown className="h-4 w-4" /> Download CV
                    </a>
                  </GradientButton>
                ) : null}
                {profile?.email ? (
                  <GradientButton asChild variant="outline">
                    <a href={`mailto:${profile.email}`}>
                      <Mail className="h-4 w-4" /> Email me
                    </a>
                  </GradientButton>
                ) : null}
              </div>
            </motion.div>

            <motion.div
              ref={aboutPortraitReveal.ref}
              initial={aboutPortraitReveal.initial}
              animate={aboutPortraitReveal.animate}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              className="lg:col-span-4"
            >
              <AboutPortrait
                src={profile?.avatarUrl ? uploadsUrl(profile.avatarUrl) : null}
                alt={profile?.displayName ?? 'Ramez Milad'}
                initials={(profile?.displayName ?? 'Ramez Milad')
                  .split(' ')
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()}
              />
            </motion.div>
          </div>

          {/* What I can ship — outcome-oriented capabilities */}
          {aboutCapabilitiesList.length > 0 ? (
            <div className="mt-10">
              <p className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(220_15%_68%)]">
                What I can ship
              </p>
              <span
                aria-hidden
                className="mt-2.5 block h-px w-12 bg-gradient-to-r from-[hsl(var(--brand-violet-soft)/0.7)] via-[hsl(var(--brand-violet-soft)/0.35)] to-transparent"
              />
              <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {aboutCapabilitiesList.map((text, i) => (
                  <Capability key={i} text={text} />
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      {/* ──────── Portfolio (tabs) ──────── */}
      <section
        id="portfolio"
        className="relative scroll-mt-20 px-4 py-16 sm:px-6 md:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            kicker={profile?.portfolioKicker?.trim() || 'Portfolio showcase'}
            title={profile?.portfolioTitle?.trim() || 'Selected work'}
            subtitle={
              profile?.portfolioSubtitle?.trim() ||
              'Production-grade student projects — built end-to-end, deployed, and actively used.'
            }
          />

          <div className="mt-10">
            <TabsPortfolio
              counts={{
                projects: sortedProjects.length,
                tech: techList.length,
              }}
              projects={
                sortedProjects.length === 0 ? (
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
                            : `Show all ${sortedProjects.length}`}
                        </GradientButton>
                      </div>
                    ) : null}
                  </>
                )
              }
              tech={<TechGrid items={techList} />}
            />
          </div>
        </div>
      </section>

      {/* ──────── Lifeline (vertical timeline + certifications) ──────── */}
      {timelineEntries.length > 0 || certificates.length > 0 ? (
        <section
          id="lifeline"
          className="relative scroll-mt-20 px-4 py-16 sm:px-6 md:py-24"
        >
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              kicker={profile?.lifelineKicker?.trim() || 'Lifeline'}
              title={profile?.lifelineTitle?.trim() || 'The road so far'}
              subtitle={
                profile?.lifelineSubtitle?.trim() ||
                'A short timeline of milestones — the moments that shaped the work behind everything above.'
              }
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
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            kicker={profile?.contactKicker?.trim() || 'Get in touch'}
            title={profile?.contactTitle?.trim() || "Let's build something"}
            subtitle={
              profile?.contactSubtitle?.trim() ||
              'Open to internships, well-scoped student projects, and ambitious side projects.'
            }
          />

          <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2">
            {profile?.email ? (
              <ContactCard
                icon={<Mail className="h-5 w-5" />}
                label="Email"
                value={profile.email}
                href={`mailto:${profile.email}`}
                action="Copy"
                onAction={copyEmail}
              />
            ) : null}
            {profile?.socials?.github ? (
              <ContactCard
                icon={<Github className="h-5 w-5" />}
                label="GitHub"
                value={profile.socials.github.replace(/^https?:\/\//, '')}
                href={profile.socials.github}
                external
              />
            ) : null}
            {profile?.socials?.linkedin ? (
              <ContactCard
                icon={<Linkedin className="h-5 w-5" />}
                label="LinkedIn"
                value={profile.socials.linkedin.replace(/^https?:\/\//, '')}
                href={profile.socials.linkedin}
                external
              />
            ) : null}
            {profile?.socials?.x ? (
              <ContactCard
                icon={<Twitter className="h-5 w-5" />}
                label="X / Twitter"
                value={profile.socials.x.replace(/^https?:\/\//, '')}
                href={profile.socials.x}
                external
              />
            ) : null}
            {!profile?.email &&
              !profile?.socials?.github &&
              !profile?.socials?.linkedin && (
                <EmptyState message="Contact info coming soon." />
              )}
          </div>

          {profile?.email ? (
            <div className="mt-10 flex justify-center">
              <GradientButton asChild>
                <a href={`mailto:${profile.email}`}>
                  <Send className="h-4 w-4" />
                  Send me a message
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
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[11rem] sm:max-w-[13rem]">
      <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[hsl(var(--brand-indigo)/0.22)] to-[hsl(var(--brand-violet-soft)/0.22)] opacity-70 blur-2xl" />
      <div className="ek-glass relative h-full w-full overflow-hidden rounded-3xl">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
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

function Capability({ text }: { text: string }) {
  return (
    <li className="group ek-glass relative flex items-start gap-3 overflow-hidden rounded-xl px-3.5 py-2.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5">
      <span
        aria-hidden
        className="mt-[3px] inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-violet))] shadow-[0_0_0_3px_hsl(var(--brand-violet)/0.18)]"
      />
      <p className="text-[13px] leading-relaxed text-[hsl(220_22%_88%)] transition-colors duration-300 group-hover:text-white">
        {text}
      </p>
    </li>
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  external?: boolean;
  action?: string;
  onAction?: () => void;
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
