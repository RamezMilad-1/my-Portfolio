'use client';

import { RotateCcw } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';

/** Shown when content can't be loaded right now (e.g. the API is waking up). */
export default function PublicError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Temporarily unavailable
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">
        This page couldn&apos;t load
      </h1>
      <p className="mt-4 text-muted-foreground">
        The content service didn&apos;t respond. Give it a few seconds and try again.
      </p>
      <GradientButton onClick={reset} className="mt-8">
        <RotateCcw className="h-4 w-4" /> Try again
      </GradientButton>
    </div>
  );
}
