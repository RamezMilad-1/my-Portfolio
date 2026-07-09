'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Image as ImageIcon,
  Users,
  User,
  LogOut,
  Home,
  Award,
  GitBranch,
  Code2,
  Mail,
  Menu,
  X,
} from 'lucide-react';
import { useLogout, useMe } from '@/lib/api/auth';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const items = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/certificates', label: 'Certificates', icon: Award },
  { href: '/admin/messages', label: 'Messages', icon: Mail },
  { href: '/admin/tech', label: 'Tech stack', icon: Code2 },
  { href: '/admin/timeline', label: 'Experience', icon: GitBranch },
  { href: '/admin/media', label: 'Media', icon: ImageIcon },
  { href: '/admin/team', label: 'Team', icon: Users },
  { href: '/admin/profile', label: 'Profile', icon: User },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: me } = useMe();
  const logout = useLogout();
  // Mobile-only: the sidebar is a slide-in drawer toggled by the top bar.
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout.mutateAsync();
    toast.success('Signed out');
    router.push('/');
  };

  // Shared nav + footer so the desktop sidebar and the mobile drawer show
  // exactly the same items. `onNavigate` lets the drawer close on tap.
  const NavContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((it) => {
          const Icon = it.icon;
          const active = it.exact
            ? pathname === it.href
            : pathname?.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={onNavigate}
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
        <p className="truncate px-3 text-xs text-[hsl(var(--muted-foreground))]">
          {me?.email}
        </p>
        <div className="mt-2 flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href="/" onClick={onNavigate}>
              <Home className="h-3.5 w-3.5" /> Site
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar — unchanged. */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] md:flex md:flex-col">
        <div className="flex h-14 items-center border-b border-[hsl(var(--border))] px-5">
          <Link href="/admin" className="font-display text-base font-semibold">
            <span className="gradient-text">Admin</span>
          </Link>
        </div>
        <NavContent />
      </aside>

      {/* Mobile top bar — fixed so it never scrolls away; hidden on desktop. */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 md:hidden">
        <Link href="/admin" className="font-display text-base font-semibold">
          <span className="gradient-text">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-2 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile drawer — full nav, same items as desktop. */}
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <div className="flex h-14 items-center justify-between border-b border-[hsl(var(--border))] px-5">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="font-display text-base font-semibold"
              >
                <span className="gradient-text">Admin</span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-md p-2 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
