'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { uploadsUrl } from '@/lib/utils';
import type { Media } from '@/lib/types';

export function MediaGallery({ media }: { media: Media[] }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!media || media.length === 0) return null;

  const next = () =>
    setOpen((i) => (i === null ? null : (i + 1) % media.length));
  const prev = () =>
    setOpen((i) => (i === null ? null : (i - 1 + media.length) % media.length));

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {media.map((m, i) => (
          <button
            type="button"
            key={m._id}
            onClick={() => setOpen(i)}
            className="group relative aspect-video overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]"
          >
            {m.kind === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={uploadsUrl(m.url)}
                alt={m.caption || 'project media'}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <video
                src={uploadsUrl(m.url)}
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            )}
            {m.caption ? (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-left">
                <p className="line-clamp-2 text-xs text-white">{m.caption}</p>
              </div>
            ) : null}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur"
            onClick={() => setOpen(null)}
          >
            <button
              onClick={() => setOpen(null)}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <motion.div
              key={media[open]._id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="max-h-[90vh] max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              {media[open].kind === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={uploadsUrl(media[open].url)}
                  alt={media[open].caption || ''}
                  className="max-h-[90vh] rounded-lg"
                />
              ) : (
                <video
                  src={uploadsUrl(media[open].url)}
                  controls
                  autoPlay
                  className="max-h-[90vh] rounded-lg"
                />
              )}
              {media[open].caption ? (
                <p className="mt-3 text-center text-sm text-white/80">{media[open].caption}</p>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
