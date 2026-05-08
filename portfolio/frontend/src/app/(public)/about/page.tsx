'use client';

import { Mail, FileDown, Github, Linkedin } from 'lucide-react';
import { useProfile } from '@/lib/api/profile';
import { uploadsUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';

export default function AboutPage() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading || !profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <div className="h-3 w-24 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
        <div className="mt-4 h-14 w-2/3 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
        <div className="mt-4 h-6 w-1/2 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="aspect-square w-full animate-pulse rounded-[28px] bg-[hsl(var(--muted))] md:col-span-4" />
          <div className="space-y-3 md:col-span-8">
            <div className="h-4 w-full animate-pulse rounded bg-[hsl(var(--muted))]" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-[hsl(var(--muted))]" />
            <div className="h-4 w-10/12 animate-pulse rounded bg-[hsl(var(--muted))]" />
            <div className="h-4 w-9/12 animate-pulse rounded bg-[hsl(var(--muted))]" />
          </div>
        </div>
      </div>
    );
  }

  const initials = profile.displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <section className="aurora relative overflow-hidden border-b border-[hsl(var(--border))]">
        <div className="noise pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 md:py-28">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
              About me
            </p>
            <h1 className="font-display mt-3 text-5xl font-semibold leading-[1.04] tracking-tight md:text-7xl">
              {profile.displayName}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-[hsl(var(--muted-foreground))] md:text-xl">
              {profile.headline}
            </p>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {profile.email ? (
                <Button asChild variant="outline" className="rounded-full">
                  <a href={`mailto:${profile.email}`}>
                    <Mail className="h-3.5 w-3.5" /> Email
                  </a>
                </Button>
              ) : null}
              {profile.resumeUrl ? (
                <Button asChild className="rounded-full">
                  <a
                    href={uploadsUrl(profile.resumeUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileDown className="h-3.5 w-3.5" /> Resume
                  </a>
                </Button>
              ) : null}
              {profile.socials?.github ? (
                <Button asChild variant="outline" className="rounded-full">
                  <a
                    href={profile.socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-3.5 w-3.5" /> GitHub
                  </a>
                </Button>
              ) : null}
              {profile.socials?.linkedin ? (
                <Button asChild variant="outline" className="rounded-full">
                  <a
                    href={profile.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                  </a>
                </Button>
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 md:py-28">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
          <Reveal className="md:col-span-4">
            <div className="ring-lift sticky top-24 aspect-square w-full overflow-hidden rounded-[28px] border border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={uploadsUrl(profile.avatarUrl)}
                  alt={profile.displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, hsl(var(--accent) / 0.18), hsl(var(--accent-secondary) / 0.16) 50%, hsl(var(--accent-tertiary) / 0.14))',
                  }}
                >
                  <span className="font-display text-7xl font-bold tracking-tight text-[hsl(var(--foreground))]/30">
                    {initials}
                  </span>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-8 space-y-12">
            {profile.education || profile.availability ? (
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {profile.education ? (
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
                      Education
                    </p>
                    <p className="mt-2 text-sm text-[hsl(var(--foreground))]">
                      {profile.education}
                    </p>
                  </div>
                ) : null}
                {profile.availability ? (
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
                      Availability
                    </p>
                    <p className="mt-2 text-sm text-[hsl(var(--foreground))]">
                      {profile.availability}
                    </p>
                  </div>
                ) : null}
              </section>
            ) : null}

            {profile.bio ? (
              <section>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
                  Bio
                </p>
                <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-[hsl(var(--foreground))] md:text-lg">
                  {profile.bio}
                </p>
              </section>
            ) : null}
          </Reveal>
        </div>
      </div>
    </>
  );
}
