'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useProfile } from '@/lib/api/profile';
import { useProjectsPublic } from '@/lib/api/projects';
import { Hero } from '@/components/public/hero';
import { SkillsMarquee } from '@/components/public/skills-marquee';
import { ProjectCard } from '@/components/public/project-card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';

export default function HomePage() {
  const { data: profile } = useProfile();
  const { data: projects } = useProjectsPublic();
  const featured = (projects ?? [])
    .filter((p) => p.isFeatured)
    .sort((a, b) => a.position - b.position);

  const hero = featured[0];
  const rest = featured.slice(1);

  const techs = Array.from(
    new Set((projects ?? []).flatMap((p) => p.tech ?? [])),
  ).sort((a, b) => a.localeCompare(b));

  return (
    <>
      <Hero profile={profile} />

      <SkillsMarquee techs={techs} />

      {/* Featured work */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-32">
        <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
              Selected work
            </p>
            <h2 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
              Featured projects
            </h2>
            <p className="mt-3 max-w-xl text-[hsl(var(--muted-foreground))]">
              Production-grade student projects — built end-to-end, deployed, and
              actively used.
            </p>
          </div>
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/projects" className="gap-1.5">
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </Reveal>

        {featured.length === 0 ? (
          <Reveal>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              No featured projects yet. Run <code>npm run db:seed</code> in the backend, or
              feature a few from the admin.
            </p>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-6 md:gap-8">
            {/* Hero card — full width */}
            {hero ? (
              <div className="md:col-span-6">
                <ProjectCard project={hero} index={0} variant="feature" />
              </div>
            ) : null}

            {/* Remaining cards in bento layout */}
            {rest.length === 1 ? (
              <div className="md:col-span-6">
                <ProjectCard project={rest[0]} index={1} variant="feature" />
              </div>
            ) : null}

            {rest.length === 2
              ? rest.map((p, i) => (
                  <div key={p._id} className="md:col-span-3">
                    <ProjectCard project={p} index={i + 1} />
                  </div>
                ))
              : null}

            {rest.length >= 3 ? (
              <>
                {rest.slice(0, 2).map((p, i) => (
                  <div key={p._id} className="md:col-span-3">
                    <ProjectCard project={p} index={i + 1} />
                  </div>
                ))}
                {rest.slice(2).map((p, i) => (
                  <div key={p._id} className="md:col-span-2">
                    <ProjectCard project={p} index={i + 3} />
                  </div>
                ))}
              </>
            ) : null}
          </div>
        )}
      </section>

      {/* About + skills strip */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
              About
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
              I build full-stack apps that ship — and look like they were designed on
              purpose.
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-7">
            <p className="text-base leading-relaxed text-[hsl(var(--muted-foreground))] md:text-lg">
              {profile?.bio ??
                'Full-stack developer with a focus on TypeScript, React, NestJS, and modern data-heavy interfaces. I build production-grade student projects that ship.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-full">
                <Link href="/about">More about me</Link>
              </Button>
              {profile?.email ? (
                <Button asChild variant="outline" className="rounded-full">
                  <a href={`mailto:${profile.email}`}>Get in touch</a>
                </Button>
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Big CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-32 sm:px-6">
        <Reveal>
          <div className="aurora noise relative overflow-hidden rounded-[32px] border border-[hsl(var(--border))] p-10 md:p-16">
            <div className="relative max-w-2xl">
              <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
                Have an idea? <span className="gradient-text">Let&apos;s build it.</span>
              </h2>
              <p className="mt-5 text-[hsl(var(--muted-foreground))] md:text-lg">
                Open to internships, well-scoped student projects, and ambitious side
                projects.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {profile?.email ? (
                  <Button asChild size="lg" className="rounded-full px-7">
                    <a href={`mailto:${profile.email}`}>
                      Email me <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                ) : null}
                {profile?.socials?.github ? (
                  <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                    <a
                      href={profile.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </a>
                  </Button>
                ) : null}
                {profile?.socials?.linkedin ? (
                  <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                    <a
                      href={profile.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
