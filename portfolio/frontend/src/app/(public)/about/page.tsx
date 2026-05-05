'use client';

import { motion } from 'framer-motion';
import { Mail, FileDown, Github, Linkedin } from 'lucide-react';
import { useProfile } from '@/lib/api/profile';
import { uploadsUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';

export default function AboutPage() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading || !profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <div className="h-12 w-2/3 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
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
        {/* avatar + bio side-by-side */}
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

          <Reveal delay={0.1} className="md:col-span-8">
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

            {profile.skills?.length ? (
              <section className="mt-12">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
                  Skills
                </p>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {profile.skills.map((cat, i) => (
                    <motion.div
                      key={cat.category}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06, duration: 0.5 }}
                      className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"
                    >
                      <p className="font-display text-sm font-semibold tracking-tight">
                        {cat.category}
                      </p>
                      <ul className="mt-3 space-y-1.5">
                        {cat.items.map((s) => (
                          <li
                            key={s.name}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-[hsl(var(--foreground))]">{s.name}</span>
                            {s.level ? (
                              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">
                                {s.level}
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </section>
            ) : null}

            {profile.timeline?.length ? (
              <section className="mt-12">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
                  Timeline
                </p>
                <ol className="relative mt-6 space-y-7 border-l-2 border-[hsl(var(--border))] pl-7">
                  {profile.timeline.map((t, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06, duration: 0.5 }}
                      className="relative"
                    >
                      <span className="absolute -left-[33px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[hsl(var(--background))] bg-[hsl(var(--accent))] shadow-md" />
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
                        {t.year}
                      </p>
                      <p className="mt-1 font-medium text-[hsl(var(--foreground))]">
                        {t.title}
                      </p>
                      {t.body ? (
                        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                          {t.body}
                        </p>
                      ) : null}
                    </motion.li>
                  ))}
                </ol>
              </section>
            ) : null}
          </Reveal>
        </div>
      </div>
    </>
  );
}
