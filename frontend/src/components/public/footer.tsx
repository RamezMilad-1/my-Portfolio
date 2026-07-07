'use client';

import Link from 'next/link';
import { Github, Linkedin, Mail, Twitter, Globe, Heart } from 'lucide-react';
import { useProfile } from '@/lib/api/profile';

export function Footer() {
  const { data } = useProfile();
  const socials = data?.socials ?? {};
  const year = new Date().getFullYear();
  const name = data?.displayName?.trim() ?? '';
  const logoInitial = data?.logoInitial?.trim() ?? '';

  return (
    <footer className="relative mt-24 border-t border-[hsl(var(--brand-violet)/0.15)] py-12">
      <div className="absolute inset-x-0 top-0 mx-auto h-px max-w-md bg-gradient-to-r from-transparent via-[hsl(var(--brand-violet))] to-transparent" />

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 sm:px-6">
        {logoInitial || name ? (
          <Link
            href="/"
            className="font-display inline-flex items-center gap-2 text-base font-bold tracking-tight"
          >
            {logoInitial ? (
              <span
                aria-hidden
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--brand-indigo))] to-[hsl(var(--brand-violet))] text-[10px] font-bold text-white"
              >
                {logoInitial}
              </span>
            ) : null}
            {name ? (
              <span className="ek-gradient-text-static">{name}</span>
            ) : null}
          </Link>
        ) : null}

        <div className="flex items-center gap-3">
          {socials.github ? (
            <SocialIcon href={socials.github} label="GitHub">
              <Github className="h-4 w-4" />
            </SocialIcon>
          ) : null}
          {socials.linkedin ? (
            <SocialIcon href={socials.linkedin} label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </SocialIcon>
          ) : null}
          {socials.x ? (
            <SocialIcon href={socials.x} label="X / Twitter">
              <Twitter className="h-4 w-4" />
            </SocialIcon>
          ) : null}
          {socials.website ? (
            <SocialIcon href={socials.website} label="Website">
              <Globe className="h-4 w-4" />
            </SocialIcon>
          ) : null}
          {data?.email ? (
            <SocialIcon href={`mailto:${data.email}`} label="Email">
              <Mail className="h-4 w-4" />
            </SocialIcon>
          ) : null}
        </div>

        <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
          © {year}{name ? ` ${name}` : ''}. Built with{' '}
          <Heart
            className="inline h-3 w-3 fill-[hsl(var(--brand-violet))] text-[hsl(var(--brand-violet))]"
            aria-label="love"
          />{' '}
          using Next.js, NestJS &amp; MongoDB.
        </p>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const external = !href.startsWith('mailto:');
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      aria-label={label}
      className="ek-glass flex h-9 w-9 items-center justify-center rounded-full text-[hsl(var(--muted-foreground))] transition-[transform,color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:text-[hsl(var(--brand-violet))] ek-glow"
    >
      {children}
    </a>
  );
}
