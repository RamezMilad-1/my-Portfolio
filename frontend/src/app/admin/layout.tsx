import type { Metadata } from 'next';
import { AdminSidebar } from '@/components/admin/sidebar';
import { PageTransition } from '@/components/motion/page-transition';

export const metadata: Metadata = {
  title: 'Admin',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <AdminSidebar />
      <div className="flex-1" id="main-content">
        <div className="mx-auto max-w-5xl p-6 pt-20 md:p-10">
          <PageTransition variant="fast">{children}</PageTransition>
        </div>
      </div>
    </div>
  );
}
