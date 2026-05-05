'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Image as ImageIcon,
  Users,
  User,
  ScanLine,
  LogOut,
  Home,
} from 'lucide-react';
import { useLogout, useMe } from '@/lib/api/auth';
import { Button } from '../ui/button';
import { ThemeToggle } from '../theme-toggle';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const items = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/media', label: 'Media', icon: ImageIcon },
  { href: '/admin/team', label: 'Team', icon: Users },
  { href: '/admin/profile', label: 'Profile', icon: User },
  { href: '/admin/scan', label: 'Folder scan', icon: ScanLine },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: me } = useMe();
  const logout = useLogout();

  const handleLogout = async () => {
    await logout.mutateAsync();
    toast.success('Signed out');
    router.push('/');
  };

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] md:flex md:flex-col">
      <div className="flex h-14 items-center border-b border-[hsl(var(--border))] px-5">
        <Link href="/admin" className="font-display text-base font-semibold">
          <span className="gradient-text">Admin</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((it) => {
          const Icon = it.icon;
          const active = it.exact ? pathname === it.href : pathname?.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-[hsl(var(--muted))] font-medium text-[hsl(var(--foreground))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
              )}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[hsl(var(--border))] p-3">
        <p className="truncate px-3 text-xs text-[hsl(var(--muted-foreground))]">{me?.email}</p>
        <div className="mt-2 flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href="/">
              <Home className="h-3.5 w-3.5" /> Site
            </Link>
          </Button>
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={handleLogout} aria-label="Sign out">
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
