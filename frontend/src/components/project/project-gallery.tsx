'use client';

import { AnimatePresence, m } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useState } from 'react';
import { DURATION, EASE_PREMIUM, SPRING } from '@/components/motion/tokens';
import { Lightbox, LightboxArrow, LightboxClose } from '@/components/ui/lightbox';
import { cloudinaryImage, cloudinaryVideoPoster } from '@/lib/cloudinary';
import type { ProjectMedia } from '@/lib/types';
import { cn } from '@/lib/utils';

const THUMBS_PER_PAGE = 4;

const slideVariants = {
  enter: (direction: number) => ({ x: direction * 28, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction * -28, opacity: 0 }),
};

const stageButton =
  'absolute top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[hsl(220_30%_8%/0.55)] text-white shadow-[0_6px_18px_-8px_hsl(220_40%_4%/0.6)] backdrop-blur-md transition-[transform,border-color,background-color,color] duration-200 ease-[var(--ease-premium)] hover:scale-105 hover:border-white/30 hover:bg-[hsl(220_30%_14%/0.75)] hover:text-brand-violet-soft';

interface ProjectGalleryProps {
  name: string;
  slides: ProjectMedia[];
  /** Shown on its own when the project has no gallery. */
  cover: string;
}

/** Image/video carousel with a caption bar, paginated thumbnails, and a full-size lightbox. */
export function ProjectGallery({ name, slides, cover }: ProjectGalleryProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const items =
    slides.length > 0
      ? slides
      : cover
        ? [{ _id: 'cover', kind: 'image' as const, url: cover, caption: '' }]
        : [];
  if (items.length === 0) return null;

  const count = items.length;
  const current = items[Math.min(index, count - 1)];
  const position = Math.min(index, count - 1);
  const altFor = (item: ProjectMedia, i: number) => item.caption || `${name} screenshot ${i + 1}`;

  const goTo = (next: number) => {
    const normalized = ((next % count) + count) % count;
    setDirection(normalized === position ? 0 : normalized > position ? 1 : -1);
    setIndex(normalized);
  };

  const pageStart = Math.floor(position / THUMBS_PER_PAGE) * THUMBS_PER_PAGE;
  const thumbs = items.slice(pageStart, pageStart + THUMBS_PER_PAGE);
  const showCaptionBar = slides.length > 0 && (current.caption || count > 1);

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(55%_50%_at_50%_45%,hsl(var(--brand-violet-soft)/0.18),transparent_75%)] blur-3xl"
      />
      <div className="glass-card glow-hover relative overflow-hidden rounded-2xl">
        <div
          className="relative aspect-[16/10] w-full overflow-hidden"
          style={{
            background:
              'radial-gradient(120% 80% at 50% 0%, hsl(0 0% 100% / 0.06), transparent 60%), linear-gradient(180deg, hsl(232 28% 12% / 0.55), hsl(232 28% 8% / 0.65))',
          }}
        >
          <AnimatePresence initial={false} custom={direction} mode="sync">
            {current.kind === 'video' ? (
              <m.video
                key={current.url}
                src={current.url}
                poster={cloudinaryVideoPoster(current.url, 1200)}
                controls
                playsInline
                preload="metadata"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: SPRING.smooth, opacity: { duration: 0.32, ease: EASE_PREMIUM } }}
                className="absolute inset-0 h-full w-full bg-black object-contain"
              />
            ) : (
              <m.button
                key={current.url}
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label={`Enlarge: ${altFor(current, position)}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: SPRING.smooth, opacity: { duration: 0.32, ease: EASE_PREMIUM } }}
                className="absolute inset-0 cursor-zoom-in"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cloudinaryImage(current.url, 960)}
                  alt={altFor(current, position)}
                  fetchPriority={position === 0 ? 'high' : undefined}
                  onError={(event) => {
                    event.currentTarget.style.visibility = 'hidden';
                  }}
                  className="h-full w-full object-cover drop-shadow-[0_14px_24px_hsl(220_40%_2%/0.35)]"
                />
              </m.button>
            )}
          </AnimatePresence>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
          />

          {count > 1 ? (
            <>
              <button
                type="button"
                onClick={() => goTo(position - 1)}
                aria-label="Previous"
                className={cn(stageButton, 'left-3')}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => goTo(position + 1)}
                aria-label="Next"
                className={cn(stageButton, 'right-3')}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          ) : null}
        </div>

        {showCaptionBar ? (
          <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] bg-[hsl(232_28%_10%/0.45)] px-4 py-2.5 backdrop-blur-md">
            <div className="flex min-w-0 items-center gap-2.5">
              {current.caption ? (
                <>
                  <span
                    aria-hidden
                    className="h-3.5 w-[2px] flex-shrink-0 rounded-full bg-gradient-to-b from-brand-indigo to-brand-violet shadow-[0_0_8px_-1px_hsl(var(--brand-violet)/0.5)]"
                  />
                  <AnimatePresence mode="wait" initial={false}>
                    <m.p
                      key={position}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: DURATION.fast, ease: EASE_PREMIUM }}
                      className="text-[13px] font-medium leading-snug text-[hsl(220_25%_92%)]"
                    >
                      {current.caption}
                    </m.p>
                  </AnimatePresence>
                </>
              ) : null}
            </div>
            {count > 1 ? (
              <p className="flex-shrink-0 text-[11px] font-semibold tabular-nums tracking-[0.14em] text-[hsl(220_15%_58%)]">
                <span className="text-brand-violet-soft">
                  {String(position + 1).padStart(2, '0')}
                </span>
                <span className="mx-1 text-[hsl(220_15%_45%)]">/</span>
                {String(count).padStart(2, '0')}
              </p>
            ) : null}
          </div>
        ) : null}

        {count > 1 ? (
          <div className="relative border-t border-white/[0.08] bg-[hsl(232_28%_10%/0.45)] px-3 py-2.5 backdrop-blur-md">
            <div className="flex gap-2 overflow-x-auto">
              {thumbs.map((item, offset) => {
                const i = pageStart + offset;
                const active = i === position;
                return (
                  <button
                    key={`${item._id}-${i}`}
                    type="button"
                    title={item.caption || undefined}
                    aria-label={item.caption || `Go to item ${i + 1}`}
                    aria-current={active ? 'true' : undefined}
                    onClick={() => goTo(i)}
                    className={cn(
                      'relative h-11 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-[hsl(220_30%_10%/0.45)] backdrop-blur transition-[transform,border-color,opacity,box-shadow] duration-300 ease-[var(--ease-premium)] hover:-translate-y-0.5',
                      active
                        ? 'border-brand-indigo/65 opacity-100 shadow-[0_0_0_1px_hsl(var(--brand-indigo)/0.30),0_6px_14px_-6px_hsl(var(--brand-violet)/0.45)]'
                        : 'border-white/10 opacity-65 hover:border-white/25 hover:opacity-100',
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        item.kind === 'video'
                          ? cloudinaryVideoPoster(item.url, 160)
                          : cloudinaryImage(item.url, 160)
                      }
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-contain p-0.5"
                    />
                    {item.kind === 'video' ? (
                      <Play
                        aria-hidden
                        className="absolute inset-0 m-auto h-4 w-4 fill-white text-white"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <Lightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={altFor(current, position)}
        onPrevious={count > 1 ? () => goTo(position - 1) : undefined}
        onNext={count > 1 ? () => goTo(position + 1) : undefined}
      >
        <LightboxClose className="border border-white/20 bg-white/10 hover:bg-white/20" />
        {count > 1 ? (
          <>
            <LightboxArrow
              direction="previous"
              onClick={() => goTo(position - 1)}
              className="border border-white/20 bg-white/10 hover:bg-white/20"
            />
            <LightboxArrow
              direction="next"
              onClick={() => goTo(position + 1)}
              className="border border-white/20 bg-white/10 hover:bg-white/20"
            />
          </>
        ) : null}

        <AnimatePresence mode="wait">
          {current.kind === 'video' ? (
            <m.video
              key={current.url}
              src={current.url}
              controls
              autoPlay
              playsInline
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-h-[90vh] max-w-[92vw] rounded-xl shadow-[0_30px_80px_-20px_hsl(220_40%_2%/0.8)]"
            />
          ) : (
            <m.img
              key={current.url}
              src={cloudinaryImage(current.url, 2000)}
              alt={altFor(current, position)}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: EASE_PREMIUM }}
              className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain shadow-[0_30px_80px_-20px_hsl(220_40%_2%/0.8)]"
            />
          )}
        </AnimatePresence>

        {current.caption || count > 1 ? (
          <div className="absolute bottom-5 left-1/2 z-10 flex max-w-[min(85vw,560px)] -translate-x-1/2 items-center gap-3 rounded-full border border-white/15 bg-[hsl(220_30%_8%/0.72)] px-5 py-2.5 shadow-[0_10px_30px_-10px_hsl(220_40%_2%/0.7)] backdrop-blur-md">
            {current.caption ? (
              <p className="truncate text-sm font-medium text-white/95">{current.caption}</p>
            ) : null}
            {count > 1 ? (
              <span className="flex-shrink-0 border-l border-white/15 pl-3 text-xs font-semibold tabular-nums text-white/60 first:border-l-0 first:pl-0">
                {position + 1} / {count}
              </span>
            ) : null}
          </div>
        ) : null}
      </Lightbox>
    </div>
  );
}
