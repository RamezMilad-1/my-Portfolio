import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="aurora relative flex min-h-dvh items-center justify-center overflow-hidden px-6 py-20">
      <div className="noise pointer-events-none absolute inset-0" />

      <div className="relative z-10 max-w-lg text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl">
          <Compass className="h-7 w-7 text-[hsl(var(--accent))]" />
        </div>

        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
          Error 404
        </p>
        <h1 className="font-display mt-3 text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          Off the <span className="gradient-text">map.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base text-[hsl(var(--muted-foreground))] md:text-lg">
          The page you&apos;re looking for doesn&apos;t exist — or moved. Let&apos;s
          get you back to something that does.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full px-7">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-6">
            <Link href="/projects">View projects</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
