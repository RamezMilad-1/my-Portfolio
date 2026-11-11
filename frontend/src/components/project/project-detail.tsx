import { ArrowLeft, Check, ExternalLink, Github, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { entranceSequence } from '@/components/motion/entrance';
import { Reveal } from '@/components/motion/reveal';
import { GradientButton } from '@/components/ui/gradient-button';
import { SectionHeading } from '@/components/ui/section-heading';
import type { Project } from '@/lib/types';
import { ProjectGallery } from './project-gallery';
import { galleryMedia, projectCover } from './project-media';
import { StickyRail } from './sticky-rail';
import { TeamGrid } from './team-grid';

function CaseStudyCard({ label, body, wide }: { label: string; body: string; wide?: boolean }) {
  return (
    <Reveal variant="land" className={`glass-card rounded-xl p-4 ${wide ? 'sm:col-span-2' : ''}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-violet-soft">
        {label}
      </p>
      <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-foreground">{body}</p>
    </Reveal>
  );
}

function BulletList({ items, icon }: { items: string[]; icon: 'sparkles' | 'check' }) {
  return (
    <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((text, index) => (
        <Reveal
          as="li"
          key={`${text}-${index}`}
          y={16}
          className="glass-card flex items-start gap-3 rounded-xl p-3.5"
        >
          {icon === 'sparkles' ? (
            <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-indigo to-brand-violet-soft text-white">
              <Sparkles className="h-3 w-3" />
            </span>
          ) : (
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-violet-soft/14 text-brand-indigo">
              <Check className="h-3 w-3" />
            </span>
          )}
          <span className="text-sm text-foreground">{text}</span>
        </Reveal>
      ))}
    </ul>
  );
}

function ProjectLinks({ project, block }: { project: Project; block?: boolean }) {
  return (
    <>
      {project.liveUrl ? (
        <GradientButton asChild className={block ? 'w-full' : undefined}>
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            {project.liveLabel || 'Live Demo'}
          </a>
        </GradientButton>
      ) : null}
      {project.githubUrl ? (
        <GradientButton asChild variant="outline" className={block ? 'w-full' : undefined}>
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
            <Github className="h-4 w-4" />
            {project.sourceLabel || 'Source'}
          </a>
        </GradientButton>
      ) : null}
    </>
  );
}

export function ProjectDetail({ project }: { project: Project }) {
  const slides = galleryMedia(project);
  const cover = projectCover(project);
  const members = project.team.map((link) => link.memberId);

  // Section numbers follow the sections that actually render: 01, 02, 03… with no gaps.
  const sections: { title: string; content: ReactNode }[] = [];
  if (project.problem || project.role || project.outcome) {
    sections.push({
      title: 'Case study',
      content: (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {project.problem ? <CaseStudyCard label="Problem" body={project.problem} /> : null}
          {project.role ? <CaseStudyCard label="My role" body={project.role} /> : null}
          {project.outcome ? (
            <CaseStudyCard
              label="Outcome"
              body={project.outcome}
              wide={!project.problem && !project.role}
            />
          ) : null}
        </div>
      ),
    });
  }
  for (const [title, markdown] of [
    ['About', project.description],
    ['Architecture', project.architecture],
  ] as const) {
    if (!markdown) continue;
    sections.push({
      title,
      content: (
        <Reveal
          variant="group"
          className="reveal-stagger prose-soft mt-5 max-w-none text-sm md:text-base"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </Reveal>
      ),
    });
  }
  if (project.highlights.length > 0) {
    sections.push({
      title: 'Key highlights',
      content: <BulletList items={project.highlights} icon="sparkles" />,
    });
  }
  if (project.features.length > 0) {
    sections.push({
      title: 'Features',
      content: <BulletList items={project.features} icon="check" />,
    });
  }
  if (members.length > 0) {
    sections.push({
      title: 'Collaborators',
      content: (
        <div className="mt-6">
          <TeamGrid members={members} />
        </div>
      ),
    });
  }

  // Page-load sequence for the header; everything below plays as it scrolls into view.
  const delay = entranceSequence(0.05, 0.08);

  return (
    <article className="pt-20">
      <section className="relative px-4 pb-10 pt-8 sm:px-6 md:pb-14 md:pt-12">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/#portfolio"
            style={delay()}
            className="enter-focus inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-brand-indigo"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All projects
          </Link>

          <div className="mt-6">
            <div className="enter-slide flex items-center gap-3" style={delay()}>
              <span
                aria-hidden
                className="h-[2px] w-10 rounded-full bg-gradient-to-r from-brand-indigo to-brand-violet shadow-[0_0_10px_-2px_hsl(var(--brand-violet)/0.55)]"
              />
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-violet-soft">
                {project.category ? `Project · ${project.category}` : 'Project'}
              </span>
            </div>

            <h1
              className="enter-sharpen mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-tight"
              style={delay({
                '--reveal-y': '24px',
                '--reveal-blur': '14px',
                '--enter-duration': '1.2s',
              })}
            >
              <span className="text-shimmer">{project.name}</span>
            </h1>

            <div className="enter-focus relative mt-4 flex items-center gap-2" style={delay()}>
              <span
                aria-hidden
                style={delay()}
                className="enter-draw h-[3px] w-40 rounded-full bg-gradient-to-r from-brand-indigo via-brand-violet to-transparent shadow-[0_0_14px_-2px_hsl(var(--brand-violet)/0.55)]"
              />
              <span
                aria-hidden
                className="-ml-2 h-2 w-2 rounded-full bg-brand-violet shadow-[0_0_12px_2px_hsl(var(--brand-violet)/0.55)]"
              />
              {project.role ? (
                <span className="ml-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {project.role}
                </span>
              ) : null}
            </div>

            {project.tagline ? (
              <p
                className="enter-sharpen mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg"
                style={delay()}
              >
                {project.tagline}
              </p>
            ) : null}

            {project.tech.length > 0 ? (
              <ul
                className="enter-stagger mt-5 flex flex-wrap gap-1.5"
                style={delay({ '--stagger-name': 'reveal-pop' })}
              >
                {project.tech.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-full border border-brand-violet-soft/28 bg-brand-violet-soft/7 px-2.5 py-0.5 text-[11px] font-medium text-brand-violet-soft shadow-[inset_0_1px_0_hsl(0_0%_100%/0.06)]"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            ) : null}

            <div
              className="enter-stagger mt-6 flex flex-wrap items-center gap-3"
              style={delay({ '--reveal-y': '16px' })}
            >
              <ProjectLinks project={project} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 md:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="order-2 space-y-12 lg:order-1 lg:col-span-8">
            {sections.map(({ title, content }, index) => (
              <div key={title}>
                <SectionHeading
                  centered={false}
                  kicker={String(index + 1).padStart(2, '0')}
                  title={title}
                />
                {content}
              </div>
            ))}
          </div>

          <aside
            className="enter-sharpen order-1 lg:order-2 lg:col-span-4"
            style={{ '--enter-delay': '0.3s', '--reveal-y': '24px' } as CSSProperties}
          >
            <StickyRail className="space-y-5">
              <ProjectGallery name={project.name} slides={slides} cover={cover} />

              <div className="glass-card space-y-4 rounded-2xl p-5">
                <ProjectLinks project={project} block />
                <dl className="space-y-3.5 border-t border-border pt-4 text-sm">
                  {project.role ? (
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Role
                      </dt>
                      <dd className="mt-1 text-foreground">{project.role}</dd>
                    </div>
                  ) : null}
                  {project.category ? (
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Category
                      </dt>
                      <dd className="mt-1 text-foreground">{project.category}</dd>
                    </div>
                  ) : null}
                  {project.tech.length > 0 ? (
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Stack
                      </dt>
                      <dd className="mt-2 flex flex-wrap gap-1">
                        {project.tech.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full border border-brand-violet-soft/20 bg-brand-violet-soft/5 px-2 py-0.5 text-[10px] font-medium text-brand-indigo"
                          >
                            {tech}
                          </span>
                        ))}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </StickyRail>
          </aside>
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <Reveal
          variant="land"
          className="glass-card flex flex-col items-start gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-violet-soft">
              Keep exploring
            </p>
            <h2 className="mt-1.5 font-display text-xl font-semibold tracking-tight md:text-2xl">
              See all projects
            </h2>
          </div>
          <GradientButton asChild>
            <Link href="/#portfolio">
              Back to portfolio <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          </GradientButton>
        </Reveal>
      </section>
    </article>
  );
}
