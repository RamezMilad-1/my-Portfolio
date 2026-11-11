import { SectionHeading } from '@/components/ui/section-heading';
import type { Certificate, Profile, TimelineEntry } from '@/lib/types';
import { CertificateGallery } from './certificate-gallery';
import { Lifeline } from './lifeline';

interface ExperienceSectionProps {
  profile: Profile;
  timeline: TimelineEntry[];
  certificates: Certificate[];
}

export function ExperienceSection({ profile, timeline, certificates }: ExperienceSectionProps) {
  if (timeline.length === 0 && certificates.length === 0) return null;

  return (
    <section id="experience" className="relative scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          kicker={profile.lifelineKicker}
          title={profile.lifelineTitle}
          subtitle={profile.lifelineSubtitle}
        />
        <Lifeline entries={timeline} />

        {certificates.length > 0 ? (
          <div className="mt-16">
            <h3 className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(220_15%_68%)]">
              Certifications
            </h3>
            <span
              aria-hidden
              className="mt-3 block h-px w-12 bg-gradient-to-r from-brand-violet-soft/70 via-brand-violet-soft/35 to-transparent"
            />
            <CertificateGallery certificates={certificates} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
