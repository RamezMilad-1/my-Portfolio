import type { Metadata } from 'next';
import { PageTransition } from '@/components/motion/page-transition';

// Unlisted utility page — reachable only by typing the URL, never indexed.
export const metadata: Metadata = {
  title: 'Create account',
  robots: { index: false, follow: false },
};

export default function CreateUserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition variant="fast">{children}</PageTransition>;
}
