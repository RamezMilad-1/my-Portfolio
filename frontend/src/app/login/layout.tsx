import type { Metadata } from 'next';
import { PageTransition } from '@/components/motion/page-transition';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <PageTransition variant="fast">{children}</PageTransition>;
}
