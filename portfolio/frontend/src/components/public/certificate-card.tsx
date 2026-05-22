'use client';

import { motion } from 'framer-motion';
import { Award, ExternalLink } from 'lucide-react';
import { useScrollReveal } from '../motion/use-scroll-reveal';
import type { Certificate } from '@/lib/types';
import { uploadsUrl } from '@/lib/utils';

interface Props {
  certificate: Certificate;
  index?: number;
  onClick?: () => void;
}

export function CertificateCard({ certificate, index = 0, onClick }: Props) {
  const img = certificate.imageUrl ? uploadsUrl(certificate.imageUrl) : null;
  const meta = [certificate.issuer, certificate.issuedAt].filter(Boolean).join(' · ');
  const { ref, initial, animate } = useScrollReveal<HTMLButtonElement>({
    y: 18,
    margin: '-40px',
  });

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      initial={initial}
      animate={animate}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="group ek-glass ek-card-sheen ek-ring-conic ek-glow relative block w-full overflow-hidden rounded-2xl text-left transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5"
    >
      {/* Top violet hairline accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-[hsl(var(--brand-violet)/0.7)] to-transparent"
      />

      {/* Parchment certificate panel */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,hsl(38_55%_95%)_0%,hsl(33_38%_88%)_55%,hsl(42_55%_93%)_100%)] p-2.5 sm:p-3">
        {/* Soft paper highlights to fake grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,hsl(0_0%_100%/0.55),transparent_55%),radial-gradient(80%_60%_at_50%_120%,hsl(38_30%_70%/0.30),transparent_60%)] mix-blend-overlay"
        />

        {/* Double-line gold inner frame holding the cert content */}
        <div className="relative h-full w-full overflow-hidden bg-[hsl(225_30%_12%/0.55)] ring-1 ring-[hsl(38_55%_50%/0.6)] shadow-[inset_0_0_0_1px_hsl(40_60%_82%/0.55),0_1px_0_hsl(40_30%_30%/0.18)]">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={certificate.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
            />
          ) : (
            <div className="relative flex h-full w-full flex-col items-center justify-center gap-2.5 px-4 text-center">
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_40%,hsl(0_0%_100%/0.08),transparent_70%)]"
              />
              <p className="relative text-[8.5px] font-bold uppercase tracking-[0.42em] text-[hsl(36_55%_78%)]">
                Certificate
              </p>
              <span
                aria-hidden
                className="relative h-px w-10 bg-gradient-to-r from-transparent via-[hsl(36_55%_70%/0.7)] to-transparent"
              />
              <Award className="relative h-12 w-12 text-[hsl(36_60%_74%)] drop-shadow-[0_6px_14px_hsl(220_40%_4%/0.5)]" />
              <p className="relative line-clamp-1 max-w-[80%] text-[10px] text-[hsl(220_18%_70%)]">
                {certificate.issuer ?? 'Awarded'}
              </p>
            </div>
          )}

          {/* Hover darken from bottom — reveals the medal & arrow */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[hsl(220_40%_4%/0.6)] via-[hsl(220_40%_4%/0.05)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* External link arrow (hover) */}
          <div className="absolute right-2 top-2 flex h-8 w-8 -translate-y-1 translate-x-1 items-center justify-center rounded-full border border-white/15 bg-[hsl(220_30%_8%/0.55)] text-white opacity-0 shadow-[0_6px_18px_-8px_hsl(220_40%_4%/0.6)] backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:translate-y-0 group-hover:border-white/30 group-hover:bg-[hsl(220_30%_14%/0.75)] group-hover:opacity-100">
            <ExternalLink className="h-3.5 w-3.5" />
          </div>

          {/* Violet wax-seal medal in the corner of the cert */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full text-white ring-1 ring-[hsl(36_55%_72%/0.55)] shadow-[0_6px_16px_-4px_hsl(var(--brand-violet)/0.55),inset_0_1px_0_hsl(0_0%_100%/0.28)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-[6deg] group-hover:scale-105 bg-[radial-gradient(circle_at_30%_28%,hsl(var(--brand-violet))_0%,hsl(var(--brand-indigo))_60%,hsl(260_45%_18%)_100%)]"
          >
            <span
              aria-hidden
              className="absolute inset-[3px] rounded-full ring-[1.5px] ring-[hsl(36_60%_82%/0.35)]"
            />
            <Award className="relative h-4 w-4 drop-shadow-[0_1px_2px_hsl(220_40%_4%/0.6)]" />
          </div>
        </div>
      </div>

      {/* Info area — title + underline + issuer/date */}
      <div className="relative p-3.5">
        <h3 className="font-display line-clamp-2 text-[14.5px] font-semibold leading-tight tracking-tight text-[hsl(220_25%_94%)] transition-colors duration-300 group-hover:text-white">
          {certificate.title}
        </h3>
        <span aria-hidden className="ek-underline mt-2" />
        {meta ? (
          <p className="mt-2 line-clamp-1 text-[11px] text-[hsl(220_15%_72%)]">
            {meta}
          </p>
        ) : null}
      </div>
    </motion.button>
  );
}
