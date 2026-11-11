import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AdminProviders } from '@/components/admin/admin-providers';
import { AdminSidebar } from '@/components/admin/sidebar';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProviders>
      <div className="flex min-h-dvh">
        <AdminSidebar />
        <main id="main-content" className="min-w-0 flex-1">
          <div className="mx-auto max-w-5xl p-6 pt-20 md:p-10">{children}</div>
        </main>
      </div>
    </AdminProviders>
  );
}
