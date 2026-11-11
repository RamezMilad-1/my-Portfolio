'use client';

import { AnimatePresence, m } from 'framer-motion';
import { FileDown, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type MouseEvent, useEffect, useRef, useState } from 'react';
import { SPRING, TRANSITION } from '@/components/motion/tokens';
import { GradientButton } from '@/components/ui/gradient-button';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

interface SiteHeaderProps {
  displayName: string;
  logoInitial: string;
  resumeUrl: string;
}

/** Fixed header with scroll-spy section links. On other pages the links lead back home. */
export function SiteHeader({ displayName, logoInitial, resumeUrl }: SiteHeaderProps) {
  const isHome = usePathname() === '/';
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<SectionId>('home');
  const [menuOpen, setMenuOpen] = useState(false);

  // While a click-initiated smooth scroll runs, the scroll spy is paused so the active pill
  // moves once to the target instead of flickering through every section on the way.
  const programmaticScroll = useRef(false);
  const releaseRef = useRef<(() => void) | null>(null);

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
        if (programmaticScroll.current) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id as SectionId);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] },
    );
    for (const { id } of SECTIONS) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, [isHome]);

  const scrollToSection = (event: MouseEvent, id: SectionId) => {
    setMenuOpen(false);
    const target = isHome ? document.getElementById(id) : null;
    if (!target) return; // Not on the home page: the link navigates there.
    event.preventDefault();

    releaseRef.current?.();
    setActiveId(id);
    programmaticScroll.current = true;
    const release = () => {
      programmaticScroll.current = false;
      window.removeEventListener('scrollend', release);
      window.clearTimeout(fallback);
      releaseRef.current = null;
    };
    // `scrollend` is the precise signal; the timeout covers browsers without it and targets
    // that are already in view (no scroll, so no scrollend).
    const fallback = window.setTimeout(release, 1000);
    window.addEventListener('scrollend', release);
    releaseRef.current = release;

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
  };

  const sectionLinks = (mobile: boolean) =>
    SECTIONS.map(({ id, label }) => {
      const active = isHome && activeId === id;
      return (
        <Link
          key={id}
          href={`/#${id}`}
          onClick={(event) => scrollToSection(event, id)}
          aria-current={active ? 'true' : undefined}
          className={
            mobile
              ? cn(
                  'block w-full rounded-xl px-4 py-2.5 text-left text-sm transition-colors',
                  active
                    ? 'bg-gradient-to-r from-brand-indigo to-brand-violet text-white'
                    : 'text-foreground hover:bg-muted',
                )
              : cn(
                  'relative rounded-full px-3.5 py-1.5 text-sm transition-colors',
                  active ? 'text-white' : 'text-muted-foreground hover:text-foreground',
                )
          }
        >
          {!mobile && active ? (
            <m.span
              layoutId="nav-pill"
              transition={SPRING.snappy}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-indigo to-brand-violet"
            />
          ) : null}
          <span className="relative z-10">{label}</span>
        </Link>
      );
    });

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-[var(--ease-premium)]',
        scrolled
          ? 'border-b border-brand-violet/15 bg-background/65 backdrop-blur-md'
          : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link
          href="/#home"
          onClick={(event) => scrollToSection(event, 'home')}
          className="flex items-center gap-2 font-display text-base font-bold tracking-tight"
        >
          {logoInitial ? (
            <span
              aria-hidden
              className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-indigo to-brand-violet text-[10px] font-bold text-white shadow-[0_4px_20px_-4px_hsl(var(--brand-violet)/0.6)]"
            >
              {logoInitial}
            </span>
          ) : null}
          {displayName ? <span className="text-brand-gradient">{displayName}</span> : null}
          {!displayName ? <span className="sr-only">Home</span> : null}
        </Link>

        <nav
          aria-label="Sections"
          className="relative ml-2 hidden flex-1 items-center gap-1 md:flex"
        >
          {sectionLinks(false)}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {resumeUrl ? (
            <GradientButton
              asChild
              variant="outline"
              className="hidden h-9 px-4 text-xs md:inline-flex"
            >
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                <FileDown className="h-3.5 w-3.5" /> Download CV
              </a>
            </GradientButton>
          ) : null}
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border md:hidden"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <m.nav
            id="mobile-menu"
            aria-label="Sections"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={TRANSITION.fast}
            className="mx-4 mb-2 rounded-2xl border border-brand-violet/18 bg-background/92 p-2 backdrop-blur-xl md:hidden"
          >
            {sectionLinks(true)}
          </m.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
