import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AnimatedBackground } from '@/components/layout/animated-background';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { MotionProvider } from '@/components/motion/motion-provider';
import { ScrollEffects } from '@/components/motion/scroll-effects';
import { getProfile } from '@/lib/api/content';
import { SITE_URL } from '@/lib/site';
import type { Profile } from '@/lib/types';

/** Who the site is about, in a phrase: "Full-Stack Developer — CS student · SE major". */
function profileSummary(profile: Profile): string | undefined {
  const role = profile.headlines.find((line) => line.trim())?.trim();
  return (
    [role, profile.headline.trim()].filter(Boolean).join(' — ') || profile.aboutLede || undefined
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const name = profile.displayName.trim();
  const title = name ? `${name} — Portfolio` : 'Portfolio';
  const description = profileSummary(profile);
  return {
    title: { default: title, template: name ? `%s · ${name}` : '%s' },
    description,
    openGraph: {
      type: 'website',
      siteName: name || undefined,
      title,
      description,
      url: SITE_URL,
      images: ['/og.png'],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og.png'] },
  };
}

/** schema.org Person, so search engines can show the profile; only from real profile data. */
function personJsonLd(profile: Profile): string | null {
  if (!profile.displayName) return null;
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.displayName,
    jobTitle: profile.headlines.find(Boolean) || profile.headline || undefined,
    url: SITE_URL,
    image: profile.avatarUrl || undefined,
    sameAs: Object.values(profile.socials).filter(Boolean),
  };
  // `<` is escaped so profile text can never close the surrounding <script> tag.
  return JSON.stringify(person).replace(/</g, '\\u003c');
}

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile();
  const jsonLd = personJsonLd(profile);

  return (
    <MotionProvider>
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      ) : null}
      <AnimatedBackground />
      <SiteHeader
        displayName={profile.displayName.trim()}
        logoInitial={profile.logoInitial.trim()}
        resumeUrl={profile.resumeUrl}
      />
      <main id="main-content" className="relative overflow-x-clip">
        {children}
      </main>
      <SiteFooter profile={profile} />
      <ScrollEffects />
    </MotionProvider>
  );
}
