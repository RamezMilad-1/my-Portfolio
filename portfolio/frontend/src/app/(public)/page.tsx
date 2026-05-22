'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Briefcase,
  Code2,
  FileDown,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Send,
  Sparkles,
  Twitter,
} from 'lucide-react';
import { useProfile } from '@/lib/api/profile';
import { useProjectsPublic } from '@/lib/api/projects';
import { useCertificatesPublic } from '@/lib/api/certificates';
import { useTimelinePublic } from '@/lib/api/timeline';
import { useTechPublic } from '@/lib/api/tech';
import { Hero } from '@/components/public/hero';
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
        className="relative scroll-mt-20 px-4 py-16 sm:px-6 md:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            kicker={profile?.aboutKicker?.trim() || 'About me'}
            title={
              profile?.aboutTitle?.trim() ||
              "A developer with a designer's eye"
            }
            subtitle={
              profile?.aboutSubtitle?.trim() ||
              'I build full-stack web apps that ship — and look like they were designed on purpose.'
            }
          />

          {/* Row 1 — greeting + intro paragraph + CTAs · portrait */}
          <div className="mt-12 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <motion.div
              ref={aboutTextReveal.ref}
              initial={aboutTextReveal.initial}
              animate={aboutTextReveal.animate}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7"
            >
              <p className="font-display text-xl font-semibold leading-tight tracking-tight text-[hsl(var(--foreground))] md:text-2xl">
                Hello, I&apos;m {profile?.displayName ?? 'Ramez Milad'}.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[hsl(var(--muted-foreground))] md:text-base">
                {profile?.bio ??
                  "I'm a 3rd-year Computer Science student majoring in Software Engineering. I focus on shipping production-grade student projects end-to-end: modern frontends in React / Next.js, typed APIs in NestJS, and data layers in MongoDB or Postgres. I care about details — micro-interactions, accessibility, and code that reads cleanly six months later."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
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
              </div>
            </motion.div>

            <motion.div
              ref={aboutPortraitReveal.ref}
              initial={aboutPortraitReveal.initial}
              animate={aboutPortraitReveal.animate}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              className="lg:col-span-5"
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

          {/* Row 2 — unified 6-card metric grid */}
          <motion.div
            ref={metricsReveal.ref}
            initial={metricsReveal.initial}
            animate={metricsReveal.animate}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 grid grid-cols-2 gap-2.5 md:grid-cols-3"
          >
            <MetricCard
              icon={<GraduationCap className="h-5 w-5" />}
              label="Education"
              value={profile?.education ?? 'B.Sc. Computer Science'}
            />
            <MetricCard
              icon={<Briefcase className="h-5 w-5" />}
              label="Availability"
              value={profile?.availability ?? 'Open to opportunities'}
            />
            <MetricCard
              icon={<Briefcase className="h-5 w-5" />}
              label="Projects shipped"
              value={stats.projectsShipped}
            />
            <MetricCard
              icon={<Code2 className="h-5 w-5" />}
              label="Technologies"
              value={stats.technologies}
            />
            <MetricCard
              icon={<GraduationCap className="h-5 w-5" />}
              label="Years coding"
              value={stats.yearsCoding}
              suffix="+"
            />
            <MetricCard
              icon={<Sparkles className="h-5 w-5" />}
              label="Certificates"
              value={certificates.length}
            />
          </motion.div>
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
                certificates: certificates.length,
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
              certificates={
                certificates.length === 0 ? (
                  <EmptyState message="No certificates yet — check back soon." />
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {certificates.map((c, i) => (
                      <CertificateCard
                        key={c._id}
                        certificate={c}
                        index={i}
                        onClick={() => setLightboxIdx(i)}
                      />
                    ))}
                  </div>
                )
              }
              tech={<TechGrid items={techList} />}
            />
          </div>
        </div>

        <CertificateLightbox
          certificates={certificates}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onNavigate={(i) => setLightboxIdx(i)}
        />
      </section>

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

      {/* ──────── Lifeline (vertical timeline) ──────── */}
      {timelineEntries.length > 0 ? (
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
            <Timeline entries={timelineEntries} />
          </div>
        </section>
      ) : null}
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
    <div className="relative mx-auto aspect-square w-full max-w-[14rem] sm:max-w-[16rem]">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[hsl(var(--brand-indigo)/0.22)] to-[hsl(var(--brand-violet-soft)/0.22)] opacity-70 blur-2xl" />
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

function MetricCard({
  icon,
  label,
  value,
  suffix = '',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  suffix?: string;
}) {
  const isNumeric = typeof value === 'number';
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className="group ek-glass ek-card-sheen ek-ring-conic ek-glow relative overflow-hidden rounded-xl p-3.5"
    >
      <div
        aria-hidden
        style={{ willChange: 'opacity' }}
        className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[hsl(var(--brand-violet)/0.10)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="ek-icon-tile relative h-8 w-8 [&_svg]:h-4 [&_svg]:w-4">
        {icon}
      </div>
      {isNumeric ? (
        <p className="font-display relative mt-2.5 text-xl font-bold tracking-tight text-[hsl(220_25%_96%)] md:text-2xl">
          {value}
          {suffix}
        </p>
      ) : (
        <p className="relative mt-2.5 text-[13px] font-medium leading-snug text-[hsl(220_25%_94%)]">
          {value}
        </p>
      )}
      <p className="relative mt-1 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[hsl(220_15%_68%)]">
        {label}
      </p>
      <span aria-hidden className="ek-underline relative mt-2" />
    </motion.div>
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
