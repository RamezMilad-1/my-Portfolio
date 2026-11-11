'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  Award,
  Code2,
  FolderKanban,
  GitBranch,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  User,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLogout, useMe, useMessages } from '@/lib/admin/queries';
import { cn } from '@/lib/utils';

const ITEMS = [
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

/** Nav links and account footer — shared by the desktop sidebar and the mobile drawer. */
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: me } = useMe();
  const { data: messages } = useMessages();
  const logout = useLogout();
  const unread = messages?.filter((message) => !message.read).length ?? 0;

  const signOut = () => {
    logout.mutate(undefined, { onSettled: () => router.replace('/login') });
  };

  return (
    <>
      <nav aria-label="Dashboard" className="flex-1 space-y-1 overflow-y-auto p-3">
        {ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{label}</span>
              {href === '/admin/messages' && unread > 0 ? (
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
                  {unread}
                  <span className="sr-only"> unread</span>
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <p className="truncate px-3 text-xs text-muted-foreground">{me?.email}</p>
        <div className="mt-2 flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href="/" onClick={onNavigate}>
              <Home className="h-3.5 w-3.5" /> Site
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            disabled={logout.isPending}
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </>
  );
}

const Brand = ({ onClick }: { onClick?: () => void }) => (
  <Link href="/admin" onClick={onClick} className="font-display text-base font-semibold">
    <span className="text-accent-gradient">Admin</span>
  </Link>
);

export function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <aside className="hidden w-64 flex-shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <div className="flex h-14 items-center border-b border-border px-5">
          <Brand />
        </div>
        <SidebarContent />
      </aside>

      {/* Phones: fixed top bar plus a slide-in drawer with the same navigation. */}
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 md:hidden">
          <Brand />
          <DialogPrimitive.Trigger
            aria-label="Open menu"
            className="rounded-md p-2 text-foreground hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </DialogPrimitive.Trigger>
        </header>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-50 bg-black/50 md:hidden" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card focus:outline-none md:hidden"
          >
            <div className="flex h-14 items-center justify-between border-b border-border px-5">
              <DialogPrimitive.Title asChild>
                <span>
                  <Brand onClick={close} />
                </span>
              </DialogPrimitive.Title>
              <DialogPrimitive.Close
                aria-label="Close menu"
                className="rounded-md p-2 text-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </DialogPrimitive.Close>
            </div>
            <SidebarContent onNavigate={close} />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
