import { Reveal } from '@/components/motion/reveal';
import { ProjectCard } from '@/components/project/project-card';
import { TechGrid, type TechGridItem } from '@/components/tech/tech-grid';
import { SectionHeading } from '@/components/ui/section-heading';
import type { Profile, Project, TechItem } from '@/lib/types';
import { PortfolioTabs } from './portfolio-tabs';
import { ShowMore } from './show-more';

const INITIAL_PROJECTS = 6;

/** The admin's tech list; until one exists, every tech used across the projects. */
function techGridItems(tech: TechItem[], projects: Project[]): TechGridItem[] {
  if (tech.length > 0) return tech.map(({ name, category }) => ({ name, category }));
  const names = new Set(projects.flatMap((project) => project.tech));
  return [...names].sort((a, b) => a.localeCompare(b)).map((name) => ({ name }));
}

interface PortfolioSectionProps {
  profile: Profile;
  projects: Project[];
  tech: TechItem[];
}

export function PortfolioSection({ profile, projects, tech }: PortfolioSectionProps) {
  const techItems = techGridItems(tech, projects);

  return (
    <section id="portfolio" className="relative scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker={profile.portfolioKicker}
          title={profile.portfolioTitle}
          subtitle={profile.portfolioSubtitle}
        />

        <div className="mt-10">
          <PortfolioTabs
            counts={{ projects: projects.length, tech: techItems.length }}
            projects={
              projects.length > 0 ? (
                <ShowMore
                  initial={INITIAL_PROJECTS}
                  moreLabel={`View all ${projects.length} projects`}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {projects.map((project) => (
                    <Reveal key={project._id} variant="land">
                      <ProjectCard project={project} />
                    </Reveal>
                  ))}
                </ShowMore>
              ) : null
            }
            tech={<TechGrid items={techItems} />}
          />
        </div>
      </div>
    </section>
  );
}
