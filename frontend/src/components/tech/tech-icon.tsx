'use client';

import { useState } from 'react';

/** Tries each logo source in turn; shows the name's initial if none loads. */
export function TechIcon({ name, sources }: { name: string; sources: string[] }) {
  const [attempt, setAttempt] = useState(0);
  const src = sources[attempt];

  if (!src) {
    return (
      <span
        aria-hidden
        className="flex h-8 w-8 items-center justify-center font-display text-lg font-bold"
      >
        <span className="text-brand-gradient">{name.charAt(0).toUpperCase()}</span>
      </span>
    );
  }

  return (
    // Third-party SVG logos at a fixed 32px: next/image optimization would add nothing.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden
      width={32}
      height={32}
      loading="lazy"
      decoding="async"
      onError={() => setAttempt((value) => value + 1)}
      className="h-8 w-8 transition-transform duration-300 group-hover:scale-110"
    />
  );
}
