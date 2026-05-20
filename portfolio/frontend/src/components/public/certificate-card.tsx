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
      className="group ek-glass ek-card-sheen ek-ring-conic ek-glow relative block w-full overflow-hidden rounded-xl text-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,hsl(244_30%_18%/0.85)_0%,hsl(225_30%_12%/0.85)_60%,hsl(275_35%_20%/0.85)_100%)]">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={certificate.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_40%,hsl(0_0%_100%/0.08),transparent_70%)]"
            />
            <Award className="relative h-16 w-16 text-[hsl(220_25%_88%)]/85 drop-shadow-[0_6px_14px_hsl(220_40%_4%/0.5)]" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[hsl(220_40%_4%/0.55)] via-[hsl(220_40%_4%/0.05)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute right-3 top-3 flex h-9 w-9 -translate-y-1 translate-x-1 items-center justify-center rounded-full border border-white/15 bg-[hsl(220_30%_8%/0.55)] text-white opacity-0 shadow-[0_6px_18px_-8px_hsl(220_40%_4%/0.6)] backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:translate-y-0 group-hover:border-white/30 group-hover:bg-[hsl(220_30%_14%/0.75)] group-hover:opacity-100">
          <ExternalLink className="h-4 w-4" />
        </div>
      </div>
      <div className="relative p-3">
        <h3 className="font-display line-clamp-1 text-[14px] font-semibold tracking-tight text-[hsl(220_25%_94%)] transition-colors duration-300 group-hover:text-white">
          {certificate.title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-[hsl(220_15%_70%)]">
          {[certificate.issuer, certificate.issuedAt].filter(Boolean).join(' · ')}
        </p>
      </div>
    </motion.button>
  );
}
