import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { SITE_URL } from '@/lib/site';
import '../styles/globals.css';

/** Geist (variable font, latin subset), self-hosted and preloaded by next/font. */
const geist = localFont({
  src: '../assets/fonts/geist-latin.woff2',
  variable: '--font-geist',
  weight: '100 900',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Portfolio',
};

export const viewport: Viewport = {
  themeColor: '#030711',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={geist.variable} data-scroll-behavior="smooth">
      <body className="min-h-dvh font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10000] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-foreground"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
