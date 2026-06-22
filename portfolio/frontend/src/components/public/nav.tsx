'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FileDown, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useProfile } from '@/lib/api/profile';
import { cn, uploadsUrl } from '@/lib/utils';
import { GradientButton } from './gradient-button';

const SECTIONS: { id: string; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';
  const { data: profile } = useProfile();

  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>('home');
  const [open, setOpen] = useState(false);

  // True while a click-initiated smooth scroll is animating. The scroll-spy
  // observer is frozen during this window so the active pill animates once to
  // the clicked target instead of thrashing through every section the scroll
  // flies past — that re-render/relayout burst is what made button-scroll jank
  // on heavy displays while trackpad scrolling stayed smooth.
  const programmaticScrollRef = useRef(false);
  const scrollSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const scrollEndHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isHome) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Ignore observer churn while a click-scroll is in flight — the target
        // is already pinned as active in handleClick.
        if (programmaticScrollRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      {
        rootMargin: '-30% 0px -55% 0px',
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
      },
    );

    // Some sections (e.g. #experience) only render after async data loads, so
    // they may not exist on the initial mount. Poll briefly until each known
    // section id appears, then stop. A MutationObserver on document.body
    // would fire on every motion/popover/keystroke and is unnecessary here.
    const observed = new Set<string>();
    const tryObserve = () => {
      for (const s of SECTIONS) {
        if (observed.has(s.id)) continue;
        const el = document.getElementById(s.id);
        if (el) {
          observer.observe(el);
          observed.add(s.id);
        }
      }
    };

    tryObserve();
    let attempts = 0;
    // Experience (the slowest section to mount) settles within ~3.5s of
    // data load — 12 attempts × 300ms ≈ 3.6s covers it without leaving an
    // interval running indefinitely on slow data fetches.
    const pollId = window.setInterval(() => {
      tryObserve();
      attempts += 1;
      if (observed.size === SECTIONS.length || attempts > 12) {
        window.clearInterval(pollId);
      }
    }, 300);

    return () => {
      observer.disconnect();
      window.clearInterval(pollId);
    };
  }, [isHome]);

  // Clean up any in-flight scroll-settle listener/timer if the nav unmounts
  // mid-scroll.
  useEffect(() => {
    return () => {
      if (scrollSettleTimerRef.current) {
        clearTimeout(scrollSettleTimerRef.current);
      }
      if (scrollEndHandlerRef.current) {
        window.removeEventListener('scrollend', scrollEndHandlerRef.current);
      }
    };
  }, []);

  const handleClick = (id: string) => {
    setOpen(false);
    if (!isHome) {
      router.push(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (!el) return;

    // Pin the pill to the clicked target and freeze the scroll-spy observer
    // until the smooth scroll settles, so the nav doesn't re-render on every
    // section the scroll passes through.
    setActiveId(id);
    programmaticScrollRef.current = true;

    // Tear down any release pending from a previous rapid click.
    if (scrollSettleTimerRef.current) {
      clearTimeout(scrollSettleTimerRef.current);
    }
    if (scrollEndHandlerRef.current) {
      window.removeEventListener('scrollend', scrollEndHandlerRef.current);
    }

    const release = () => {
      programmaticScrollRef.current = false;
      if (scrollEndHandlerRef.current) {
        window.removeEventListener('scrollend', scrollEndHandlerRef.current);
        scrollEndHandlerRef.current = null;
      }
      if (scrollSettleTimerRef.current) {
        clearTimeout(scrollSettleTimerRef.current);
        scrollSettleTimerRef.current = null;
      }
    };
    scrollEndHandlerRef.current = release;
    // `scrollend` is the precise settle signal on modern Chrome/Safari; the
    // timeout is a fallback for browsers without it and a safety net when the
    // target is already in view (no scroll → no scrollend fires).
    window.addEventListener('scrollend', release);
    scrollSettleTimerRef.current = setTimeout(release, 1000);

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-[hsl(var(--brand-violet)/0.15)] bg-[hsl(var(--background)/0.65)] backdrop-blur-md'
          : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="font-display flex items-center gap-2 text-base font-bold tracking-tight"
          onClick={(e) => {
            if (isHome) {
              e.preventDefault();
              handleClick('home');
            }
          }}
        >
          <span
            aria-hidden
            className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--brand-indigo))] to-[hsl(var(--brand-violet))] text-[10px] font-bold text-white shadow-[0_4px_20px_-4px_hsl(var(--brand-violet)/0.6)]"
          >
            {profile?.logoInitial?.trim() || 'R'}
          </span>
          <span className="ek-gradient-text-static">
            {profile?.displayName ?? 'Ramez Milad'}
          </span>
        </Link>

        <nav className="relative ml-2 hidden flex-1 items-center gap-1 md:flex">
          {SECTIONS.map((s) => {
            const active = isHome && activeId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => handleClick(s.id)}
                className={cn(
                  'relative rounded-full px-3.5 py-1.5 text-sm transition-colors',
                  active
                    ? 'text-white'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="nav-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[hsl(var(--brand-indigo))] to-[hsl(var(--brand-violet))]"
                  />
                ) : null}
                <span className="relative z-10">{s.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {profile?.resumeUrl ? (
            <GradientButton
              asChild
              variant="outline"
              size="md"
              className="hidden h-9 px-4 text-xs md:inline-flex"
            >
              <a
                href={uploadsUrl(profile.resumeUrl)}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <FileDown className="h-3.5 w-3.5" /> Download CV
              </a>
            </GradientButton>
          ) : null}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[hsl(var(--border))] md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mx-4 mb-2 rounded-2xl border border-[hsl(var(--brand-violet)/0.18)] bg-[hsl(var(--background)/0.92)] p-2 backdrop-blur-xl md:hidden"
          >
            {SECTIONS.map((s) => {
              const active = isHome && activeId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleClick(s.id)}
                  className={cn(
                    'block w-full rounded-xl px-4 py-2.5 text-left text-sm transition-colors',
                    active
                      ? 'bg-gradient-to-r from-[hsl(var(--brand-indigo))] to-[hsl(var(--brand-violet))] text-white'
                      : 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]',
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
