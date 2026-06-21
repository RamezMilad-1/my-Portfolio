import type { Metadata } from 'next';
import localFont from 'next/font/local';
import '../styles/globals.css';
import { Providers } from '@/components/providers';
import { cn } from '@/lib/utils';

const geist = localFont({
  src: '../assets/fonts/geist-latin.woff2',
  variable: '--font-sans',
  weight: '100 900',
  display: 'swap',
});

const display = localFont({
  src: '../assets/fonts/geist-latin.woff2',
  variable: '--font-display',
  weight: '600 900',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
  title: {
    default: 'Ramez Milad — Portfolio',
    template: '%s · Ramez Milad',
  },
  description:
    '3rd-year Computer Science (Software Engineering) student. Full-stack developer building production-grade student projects with React, Next.js, NestJS, and MongoDB.',
  openGraph: {
    title: 'Ramez Milad — Portfolio',
    description:
      'Full-stack developer building production-grade student projects with React, Next.js, NestJS, and MongoDB.',
    type: 'website',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ramez Milad — Portfolio',
    description:
      'Full-stack developer building production-grade student projects with React, Next.js, NestJS, and MongoDB.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn('dark', 'font-sans', geist.variable, display.variable)}
      style={{ colorScheme: 'dark' }}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10000] focus:rounded-md focus:bg-[hsl(var(--accent))] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[hsl(var(--accent-foreground))]"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
