import type { Metadata } from 'next';
import { AboutSection } from '@/components/home/about-section';
import { ContactSection } from '@/components/home/contact-section';
import { ExperienceSection } from '@/components/home/experience-section';
import { Hero } from '@/components/home/hero';
import { PortfolioSection } from '@/components/home/portfolio-section';
import { getCertificates, getProfile, getProjects, getTech, getTimeline } from '@/lib/api/content';

export const metadata: Metadata = { alternates: { canonical: '/' } };

export default async function HomePage() {
  const [profile, projects, certificates, timeline, tech] = await Promise.all([
    getProfile(),
    getProjects(),
    getCertificates(),
    getTimeline(),
    getTech(),
  ]);

  return (
    <>
      <Hero profile={profile} />
      <AboutSection profile={profile} />
      <PortfolioSection profile={profile} projects={projects} tech={tech} />
      <ExperienceSection profile={profile} timeline={timeline} certificates={certificates} />
      <ContactSection profile={profile} />
    </>
  );
}
