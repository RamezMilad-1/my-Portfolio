'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';
import type { Certificate } from '@/lib/types';
import { uploadsUrl } from '@/lib/utils';

interface Props {
  certificates: Certificate[];
  index: number | null;
  onClose: () => void;
  onNavigate: (i: number) => void;
}

export function CertificateLightbox({
  certificates,
  index,
  onClose,
  onNavigate,
}: Props) {
  const open = index !== null;
  const cert = index !== null ? certificates[index] : null;

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && index !== null) {
        onNavigate((index + 1) % certificates.length);
      }
      if (e.key === 'ArrowLeft' && index !== null) {
        onNavigate((index - 1 + certificates.length) % certificates.length);
      }
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, index, certificates.length, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {open && cert ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="ek-glass relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </button>

            {certificates.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    onNavigate(
                      (index! - 1 + certificates.length) % certificates.length,
                    )
                  }
                  aria-label="Previous"
                  className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onNavigate((index! + 1) % certificates.length)
                  }
                  aria-label="Next"
                  className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            ) : null}

            <div className="relative bg-black">
              {cert.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={uploadsUrl(cert.imageUrl)}
                  alt={cert.title}
                  className="max-h-[70vh] w-full object-contain"
                />
              ) : (
                <div className="flex h-[60vh] items-center justify-center text-white/30">
                  No image
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                {cert.title}
              </h3>
              {(cert.issuer || cert.issuedAt) && (
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  {[cert.issuer, cert.issuedAt].filter(Boolean).join(' · ')}
                </p>
              )}
              {cert.description ? (
                <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {cert.description}
                </p>
              ) : null}
              {cert.credentialUrl ? (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--brand-indigo))] hover:underline"
                >
                  Verify credential <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
