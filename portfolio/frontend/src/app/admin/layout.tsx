import { AdminSidebar } from '@/components/admin/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <AdminSidebar />
      <div className="flex-1">
        <div className="mx-auto max-w-5xl p-6 md:p-10">{children}</div>
      </div>
    </div>
  );
}
