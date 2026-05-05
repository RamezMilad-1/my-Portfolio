import type { Metadata } from 'next';
import '../styles/globals.css';
import { Providers } from '@/components/providers';

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
