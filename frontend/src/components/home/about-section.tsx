import { FileDown } from 'lucide-react';
import { SocialLinks } from '@/components/layout/social-links';
import { Reveal } from '@/components/motion/reveal';
import { DISTANCE, STAGGER } from '@/components/motion/tokens';
import { GradientButton } from '@/components/ui/gradient-button';
import { SectionHeading } from '@/components/ui/section-heading';
import { StatusBadge } from '@/components/ui/status-badge';
import type { Profile } from '@/lib/types';
import { initials, paragraphs } from '@/lib/utils';
import { Portrait } from './portrait';

interface Capability {
  label: string;
  value: string;
}

/**
 * "Label: description" (or "Label — description") becomes a labelled capability; text without
 * a separator is shown under a generic label.
 */
function capabilityFromText(text: string): Capability {
  const normalized = text.trim();
  const separator = normalized.search(/:\s|\s(?:-|–|—)\s/);
  if (separator === -1) return { label: 'Profile', value: normalized };
  const label = normalized.slice(0, separator).trim();
  const value = normalized
    .slice(separator)
    .replace(/^:\s*/, '')
    .replace(/^\s(?:-|–|—)\s*/, '')
    .trim();
  return { label: label || 'Profile', value: value || normalized };
}

/** Focus blocks win; otherwise the capability statements are used. */
function capabilitiesOf(profile: Profile): Capability[] {
  const fromBlocks = profile.aboutFocusBlocks
    .map((block) => ({ label: block.heading.trim() || 'Profile', value: block.body.trim() }))
    .filter((capability) => capability.value);
  if (fromBlocks.length > 0) return fromBlocks;
  return profile.aboutCapabilities
    .map((text) => text.trim())
    .filter(Boolean)
    .map(capabilityFromText)
    .filter((capability) => capability.label && capability.value);
}

const Divider = ({ className = 'my-4' }: { className?: string }) => (
  <div
    aria-hidden
    className={`${className} h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent`}
  />
);

export function AboutSection({ profile }: { profile: Profile }) {
  const name = profile.displayName.trim();
  const tagline = profile.aboutTagline.trim();
  const lede = profile.aboutLede.trim();
  const bio = paragraphs(profile.bio);
  const dividerLabel = profile.aboutDividerLabel.trim();
  const capabilities = capabilitiesOf(profile);
  const portraitInitials = initials(name);
  const showPortrait = Boolean(profile.avatarUrl || portraitInitials);
  const facts = [
    { label: 'Education', value: profile.education },
    { label: 'Location', value: profile.aboutFactLocation },
    { label: 'Core stack', value: profile.aboutFactStack },
    { label: 'Available for', value: profile.aboutFactAvailable },
  ]
    .map((fact) => ({ ...fact, value: fact.value.trim() }))
    .filter((fact) => fact.value);
  const hasSocials = Boolean(
    profile.socials.github ||
    profile.socials.linkedin ||
    profile.socials.x ||
    profile.socials.website ||
    profile.email,
  );
  const hasIdentityRow = Boolean(name || tagline || profile.availability || profile.resumeUrl);

  return (
    <section id="about" className="relative scroll-mt-20 px-4 py-10 sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker={profile.aboutKicker}
          title={profile.aboutTitle}
          subtitle={profile.aboutSubtitle}
          variant="classic"
        />

        {/* Recruiter card: name, role, status and scannable facts. */}
        {hasIdentityRow || facts.length > 0 || hasSocials ? (
          <Reveal className="glass-card card-sheen relative mt-14 overflow-hidden rounded-2xl p-4 sm:p-5">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-brand-violet/60 to-transparent"
            />

            {hasIdentityRow ? (
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                {name || tagline ? (
                  <h3 className="font-display text-base font-semibold tracking-tight text-foreground sm:text-lg md:text-xl">
                    {name}
                    {tagline ? (
                      <span className="font-normal text-[hsl(220_15%_64%)]"> {tagline}</span>
                    ) : null}
                  </h3>
                ) : null}
                <div className="flex flex-wrap items-center gap-2.5">
                  {profile.availability ? (
                    <StatusBadge tone="violet" label={profile.availability} />
                  ) : null}
                  {profile.resumeUrl ? (
                    <GradientButton
                      asChild
                      variant="outline"
                      className="h-8 px-4 text-xs font-medium"
                    >
                      <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                        <FileDown className="h-3.5 w-3.5" /> Download CV
                      </a>
                    </GradientButton>
                  ) : null}
                </div>
              </div>
            ) : null}

            {facts.length > 0 ? (
              <>
                <Divider />
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                  {facts.map((fact) => (
                    <div key={fact.label}>
                      <dt className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[hsl(220_15%_62%)]">
                        {fact.label}
                      </dt>
                      <dd className="mt-1 text-[12.5px] font-medium leading-snug text-[hsl(220_25%_94%)] md:text-[13px]">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : null}

            {hasSocials ? (
              <>
                <Divider />
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[hsl(220_15%_62%)]">
                    Find me on
                  </p>
                  <SocialLinks
                    profile={profile}
                    className="flex flex-wrap items-center gap-2"
                    linkClassName="glass-card inline-flex h-7 w-7 items-center justify-center rounded-full text-[hsl(220_22%_88%)] transition-[transform,color,box-shadow] duration-300 ease-[var(--ease-premium)] hover:-translate-y-0.5 hover:text-white"
                  />
                </div>
              </>
            ) : null}
          </Reveal>
        ) : null}

        {/* Prose and portrait. */}
        {lede || bio.length > 0 || showPortrait ? (
          <div className="mt-14 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <Reveal x={-DISTANCE.lg} y={0} className="lg:col-span-8">
              {lede ? (
                <p className="font-display text-xl font-semibold leading-[1.22] tracking-tight text-foreground md:text-[22px]">
                  {lede}
                </p>
              ) : null}
              {bio.map((paragraph, index) => (
                <p
                  key={index}
                  className={`${index === 0 ? (lede ? 'mt-4' : '') : 'mt-3'} text-[13.5px] leading-relaxed text-muted-foreground md:text-[14.5px]`}
                >
                  {paragraph}
                </p>
              ))}
            </Reveal>
            {showPortrait ? (
              <Reveal x={DISTANCE.lg} y={0} delay={STAGGER.loose} className="lg:col-span-4">
                <Portrait
                  src={profile.avatarUrl}
                  alt={name || 'Portrait'}
                  initials={portraitInitials}
                />
              </Reveal>
            ) : null}
          </div>
        ) : null}

        {dividerLabel ? (
          <div aria-hidden className="mt-5 flex items-center justify-center gap-4">
            <span className="h-px w-20 bg-gradient-to-r from-transparent to-brand-violet/70" />
            <p className="font-display text-[10.5px] font-semibold uppercase tracking-[0.34em] text-[hsl(220_20%_74%)]">
              {dividerLabel}
            </p>
            <span className="h-px w-20 bg-gradient-to-r from-brand-violet/70 to-transparent" />
          </div>
        ) : null}

        {capabilities.length > 0 ? (
          <Reveal y={DISTANCE.lg} className="mt-6">
            <div className="relative overflow-hidden rounded-3xl bg-white/[0.03] p-7 ring-1 ring-inset ring-white/[0.06] sm:p-10">
              <span
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-brand-violet/8 blur-3xl"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.15] to-transparent"
              />
              <dl className="relative grid grid-cols-1 gap-x-12 gap-y-7 sm:grid-cols-2 sm:gap-y-9">
                {capabilities.map((capability, index) => (
                  <div key={`${capability.label}-${index}`}>
                    <dt className="font-display text-[15px] font-semibold tracking-tight text-[hsl(220_30%_96%)] md:text-base">
                      {capability.label}
                    </dt>
                    <dd className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground md:text-[14px]">
                      {capability.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
