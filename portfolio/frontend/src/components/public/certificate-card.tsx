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
      className="group ek-glass relative block w-full overflow-hidden rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 ek-glow"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[hsl(var(--brand-indigo)/0.16)] to-[hsl(var(--brand-violet-soft)/0.16)]">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={certificate.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Award className="h-16 w-16 text-[hsl(var(--brand-indigo))]" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
          <ExternalLink className="h-4 w-4" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display line-clamp-1 text-base font-semibold tracking-tight">
          {certificate.title}
        </h3>
        <p className="mt-1 line-clamp-1 text-xs text-[hsl(var(--muted-foreground))]">
          {[certificate.issuer, certificate.issuedAt].filter(Boolean).join(' · ')}
        </p>
      </div>
    </motion.button>
  );
}
