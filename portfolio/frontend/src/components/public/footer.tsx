'use client';

import Link from 'next/link';
import { useProfile } from '@/lib/api/profile';
import { Github, Linkedin, Mail, Twitter } from 'lucide-react';

export function Footer() {
  const { data } = useProfile();
  const socials = data?.socials ?? {};
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-[hsl(var(--border))] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          © {year} {data?.displayName ?? 'Ramez Milad'}. Built with Next.js, NestJS, and MongoDB.
        </p>
        <div className="flex items-center gap-3">
          {socials.github ? (
            <a
              href={socials.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              <Github className="h-5 w-5" />
            </a>
          ) : null}
          {socials.linkedin ? (
            <a
              href={socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          ) : null}
          {socials.x ? (
            <a
              href={socials.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X / Twitter"
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              <Twitter className="h-5 w-5" />
            </a>
          ) : null}
          {data?.email ? (
            <Link
              href={`mailto:${data.email}`}
              aria-label="Email"
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              <Mail className="h-5 w-5" />
            </Link>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
