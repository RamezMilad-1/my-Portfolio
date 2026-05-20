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
import { Hero } from '@/components/public/hero';
import { useScrollReveal } from '@/components/motion/use-scroll-reveal';
import { SectionHeading } from '@/components/public/section-heading';
import { TabsPortfolio } from '@/components/public/tabs-portfolio';
import { ProjectCardV2 } from '@/components/public/project-card-v2';
import { CertificateCard } from '@/components/public/certificate-card';
import { CertificateLightbox } from '@/components/public/certificate-lightbox';
import { TechGrid } from '@/components/public/tech-grid';
import { GradientButton } from '@/components/public/gradient-button';
import { uploadsUrl } from '@/lib/utils';
import { toast } from 'sonner';

export default function HomePage() {
  const { data: profile } = useProfile();
  const { data: projects = [] } = useProjectsPublic();
  const { data: certificates = [] } = useCertificatesPublic();

  // Scroll to hash on load (e.g. arriving from /#about)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = window.location.hash.replace('#', '');
    if (id) {
      const el = document.getElementById(id);
      if (el) {
        setTimeout(
          () => el.scrollIntoView({ behavior: 'smooth', block: 'start' }),
          100,
        );
      }
    }
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
    const set = new Set<string>();
    for (const p of projects) for (const t of p.tech ?? []) set.add(t);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [projects]);

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
            kicker="About me"
            title="A developer with a designer's eye"
            subtitle="I build full-stack web apps that ship — and look like they were designed on purpose."
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
                <GradientButton asChild variant="outline">
                  <a
                    href={profile?.resumeUrl ? uploadsUrl(profile.resumeUrl) : '/cv.pdf'}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <FileDown className="h-4 w-4" /> Download CV
                  </a>
                </GradientButton>
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
            className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3"
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
            kicker="Portfolio showcase"
            title="Selected work"
            subtitle="Production-grade student projects — built end-to-end, deployed, and actively used."
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
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                  <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
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
            kicker="Get in touch"
            title="Let's build something"
            subtitle="Open to internships, well-scoped student projects, and ambitious side projects."
          />

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
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
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="ek-glass relative overflow-hidden rounded-2xl p-4 ek-glow"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--brand-violet-soft)/0.14)] text-[hsl(var(--brand-indigo))]">
        {icon}
      </div>
      {isNumeric ? (
        <p className="font-display mt-3 text-2xl font-bold text-[hsl(var(--foreground))] md:text-3xl">
          {value}
          {suffix}
        </p>
      ) : (
        <p className="mt-3 text-sm font-medium leading-snug text-[hsl(var(--foreground))]">
          {value}
        </p>
      )}
      <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
        {label}
      </p>
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
    <div className="group ek-glass relative flex items-center gap-3.5 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 ek-glow">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--brand-indigo)/0.16)] to-[hsl(var(--brand-violet-soft)/0.16)] text-[hsl(var(--brand-indigo))]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
          {label}
        </p>
        <a
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          className="mt-0.5 block truncate text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:text-[hsl(var(--brand-indigo))]"
        >
          {value}
        </a>
      </div>
      {action && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="rounded-full border border-[hsl(var(--brand-violet-soft)/0.30)] px-3 py-1 text-xs font-semibold text-[hsl(var(--brand-indigo))] transition-colors hover:bg-[hsl(var(--brand-violet-soft)/0.10)]"
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
