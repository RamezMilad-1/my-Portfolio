import type { Metadata } from 'next';
import '../styles/globals.css';
import { Providers } from '@/components/providers';
import { CustomCursor } from '@/components/motion/cursor';

export const metadata: Metadata = {
  title: {
    default: 'Ramez Milad — Portfolio',
    template: '%s · Ramez Milad',
  },
  description:
    '3rd-year Computer Science (Software Engineering) student. Full-stack developer building production-grade student projects with React, Next.js, NestJS, and MongoDB.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10000] focus:rounded-md focus:bg-[hsl(var(--accent))] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[hsl(var(--accent-foreground))]"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
        <CustomCursor />
      </body>
    </html>
  );
}
