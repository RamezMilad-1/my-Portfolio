'use client';

import { useState } from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { Award, ExternalLink } from 'lucide-react';
import { useScrollReveal } from '../motion/use-scroll-reveal';
import {
  DISTANCE,
  DURATION,
  EASE_PREMIUM,
  STAGGER,
  VIEWPORT,
  staggerDelay,
} from '../motion/tokens';
import type { Certificate } from '@/lib/types';

interface Props {
  certificate: Certificate;
  index?: number;
  onClick?: () => void;
}

export function CertificateCard({ certificate, index = 0, onClick }: Props) {
  const img = certificate.imageUrl || null;
  const meta = [certificate.issuer, certificate.issuedAt].filter(Boolean).join(' · ');
  const [broken, setBroken] = useState(false);
  const showImage = !!img && !broken;
  const { ref, initial, animate } = useScrollReveal<HTMLButtonElement>({
    y: DISTANCE.md,
    margin: VIEWPORT.chrome,
  });

  return (
    <m.button
      ref={ref}
      type="button"
      onClick={onClick}
      initial={initial}
      animate={animate}
      transition={{
        duration: DURATION.moderate,
        delay: staggerDelay(index, STAGGER.tight),
        ease: EASE_PREMIUM,
      }}
      className="group ek-glass ek-card-sheen ek-ring-conic ek-glow relative block w-full overflow-hidden rounded-xl text-left transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1"
    >
      {/* Top violet hairline accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-[hsl(var(--brand-violet)/0.7)] to-transparent"
      />

      {/* Dark glass certificate panel */}
      <div className="relative aspect-[16/11] overflow-hidden bg-[radial-gradient(120%_80%_at_50%_-10%,hsl(var(--brand-violet)/0.18),transparent_55%),linear-gradient(180deg,hsl(225_30%_10%)_0%,hsl(225_35%_7%)_100%)] p-2">
        {/* Inner frame */}
        <div className="relative h-full w-full overflow-hidden rounded-md bg-[hsl(225_30%_8%/0.55)] ring-1 ring-white/[0.08] shadow-[inset_0_1px_0_hsl(0_0%_100%/0.04),inset_0_0_24px_hsl(220_40%_4%/0.45)]">
          {showImage ? (
            <Image
              src={img}
              alt={certificate.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              onError={() => setBroken(true)}
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
            />
          ) : (
            <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center">
              {/* Faint centered glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_45%,hsl(var(--brand-violet)/0.12),transparent_70%)]"
              />
              {/* Centered violet medal */}
              <div
                aria-hidden
                className="relative flex h-12 w-12 items-center justify-center rounded-full text-white ring-1 ring-white/15 shadow-[0_10px_28px_-8px_hsl(var(--brand-violet)/0.55),inset_0_1px_0_hsl(0_0%_100%/0.28)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-[6deg] group-hover:scale-105 bg-[radial-gradient(circle_at_30%_28%,hsl(var(--brand-violet))_0%,hsl(var(--brand-indigo))_60%,hsl(260_45%_18%)_100%)]"
              >
                <span
                  aria-hidden
                  className="absolute inset-[3px] rounded-full ring-[1.5px] ring-white/15"
                />
                <Award className="relative h-5 w-5 drop-shadow-[0_2px_4px_hsl(220_40%_4%/0.6)]" />
              </div>
              <p className="relative mt-0.5 text-[8px] font-bold uppercase tracking-[0.35em] text-[hsl(var(--brand-violet-soft))]">
                Certificate
              </p>
              <span
                aria-hidden
                className="relative h-px w-10 bg-gradient-to-r from-transparent via-[hsl(var(--brand-violet)/0.55)] to-transparent"
              />
              {certificate.issuer ? (
                <p className="relative line-clamp-1 max-w-[80%] text-[10px] text-[hsl(220_15%_72%)]">
                  {certificate.issuer}
                </p>
              ) : null}
            </div>
          )}

          {/* Hover darken from bottom */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[hsl(220_40%_4%/0.55)] via-[hsl(220_40%_4%/0.04)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* External link arrow (hover) */}
          <div className="absolute right-2 top-2 flex h-7 w-7 -translate-y-1 translate-x-1 items-center justify-center rounded-full border border-white/15 bg-[hsl(220_30%_8%/0.55)] text-white opacity-0 shadow-[0_6px_18px_-8px_hsl(220_40%_4%/0.6)] backdrop-blur-md transition-[transform,opacity,border-color,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:translate-y-0 group-hover:border-white/30 group-hover:bg-[hsl(220_30%_14%/0.75)] group-hover:opacity-100">
            <ExternalLink className="h-3 w-3" />
          </div>

          {/* Corner violet medal — only when image is shown (avoids duplicate with fallback) */}
          {showImage ? (
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full text-white ring-1 ring-white/15 shadow-[0_6px_16px_-4px_hsl(var(--brand-violet)/0.55),inset_0_1px_0_hsl(0_0%_100%/0.28)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-[6deg] group-hover:scale-105 bg-[radial-gradient(circle_at_30%_28%,hsl(var(--brand-violet))_0%,hsl(var(--brand-indigo))_60%,hsl(260_45%_18%)_100%)]"
            >
              <span
                aria-hidden
                className="absolute inset-[3px] rounded-full ring-[1.5px] ring-white/15"
              />
              <Award className="relative h-3.5 w-3.5 drop-shadow-[0_1px_2px_hsl(220_40%_4%/0.6)]" />
            </div>
          ) : null}
        </div>
      </div>

      {/* Info area — title + underline + issuer/date */}
      <div className="relative p-3">
        <h3 className="font-display line-clamp-2 text-[13.5px] font-semibold leading-tight tracking-tight text-[hsl(220_25%_94%)] transition-colors duration-300 group-hover:text-white">
          {certificate.title}
        </h3>
        <span aria-hidden className="ek-underline mt-1.5" />
        {meta ? (
          <p className="mt-1.5 line-clamp-1 text-[10.5px] text-[hsl(220_15%_72%)]">
            {meta}
          </p>
        ) : null}
      </div>
    </m.button>
  );
}
