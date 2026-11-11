import { Heart } from 'lucide-react';
import Link from 'next/link';
import type { Profile } from '@/lib/types';
import { SocialLinks } from './social-links';

export function SiteFooter({ profile }: { profile: Profile }) {
  const name = profile.displayName.trim();
  const logoInitial = profile.logoInitial.trim();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-brand-violet/15 py-12">
      <div className="absolute inset-x-0 top-0 mx-auto h-px max-w-md bg-gradient-to-r from-transparent via-brand-violet to-transparent" />

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 sm:px-6">
        {logoInitial || name ? (
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-display text-base font-bold tracking-tight"
          >
            {logoInitial ? (
              <span
                aria-hidden
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-indigo to-brand-violet text-[10px] font-bold text-white"
              >
                {logoInitial}
              </span>
            ) : null}
            {name ? <span className="text-brand-gradient">{name}</span> : null}
          </Link>
        ) : null}

        <SocialLinks
          profile={profile}
          className="flex items-center gap-3"
          linkClassName="glass-card glow-hover flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-[transform,color,border-color,box-shadow] duration-300 ease-[var(--ease-premium)] hover:-translate-y-0.5 hover:text-brand-violet"
        />

        <p className="text-center text-xs text-muted-foreground">
          © {year}
          {name ? ` ${name}` : ''}. Built with{' '}
          <Heart aria-label="love" className="inline h-3 w-3 fill-brand-violet text-brand-violet" />{' '}
          using Next.js, NestJS &amp; MongoDB.
        </p>
      </div>
    </footer>
  );
}
