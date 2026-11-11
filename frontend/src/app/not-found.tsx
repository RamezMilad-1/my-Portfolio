import { ArrowLeft, Compass } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="aurora relative flex min-h-dvh items-center justify-center overflow-hidden px-6 py-20"
    >
      <div className="noise pointer-events-none absolute inset-0" />

      <div className="relative z-10 max-w-lg text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card shadow-xl">
          <Compass className="h-7 w-7 text-accent" />
        </div>

        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Error 404
        </p>
        <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          Off the <span className="text-accent-gradient">map.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base text-muted-foreground md:text-lg">
          The page you&apos;re looking for doesn&apos;t exist — or moved. Let&apos;s get you back to
          something that does.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full px-7">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-6">
            <Link href="/#portfolio">View projects</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
