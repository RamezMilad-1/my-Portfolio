'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '../theme-toggle';
import { useMe } from '@/lib/api/auth';
import { Button } from '../ui/button';

const items = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
];

export function Nav() {
  const pathname = usePathname();
  const { data: me } = useMe();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-300',
        scrolled
          ? 'glass-strong border-b border-[hsl(var(--border))]'
          : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="font-display flex items-center gap-2 text-base font-semibold tracking-tight"
        >
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--accent-secondary))]"
          />
          <span className="gradient-text">Ramez Milad</span>
        </Link>

        <nav className="relative ml-2 hidden flex-1 items-center gap-1 sm:flex">
          {items.map((it) => {
            const active = it.href === '/' ? pathname === '/' : pathname?.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  'relative rounded-full px-3.5 py-1.5 text-sm transition-colors',
                  active
                    ? 'text-[hsl(var(--foreground))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="nav-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-[hsl(var(--muted))]"
                  />
                ) : null}
                <span className="relative z-10">{it.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {me ? (
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/admin">
                <LayoutDashboard className="h-3.5 w-3.5" /> Admin
              </Link>
            </Button>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
