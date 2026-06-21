import { Nav } from '@/components/public/nav';
import { Footer } from '@/components/public/footer';
import { AnimatedBackground } from '@/components/public/animated-background';
import { PageTransition } from '@/components/motion/page-transition';

type PublicProfile = {
  displayName?: string;
  headline?: string;
  socials?: Record<string, string>;
};

async function getProfile(): Promise<PublicProfile | null> {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';

  try {
    const res = await fetch(`${apiBase}/profile`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicProfile;
  } catch {
    return null;
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  ).replace(/\/$/, '');
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile?.displayName ?? 'Ramez Milad',
    jobTitle: profile?.headline ?? 'Full-stack developer',
    url: siteUrl,
    sameAs: Object.values(profile?.socials ?? {}).filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <AnimatedBackground />
      <Nav />
      <main id="main-content" className="relative">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
