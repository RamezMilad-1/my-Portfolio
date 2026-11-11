'use client';

import { Award, ExternalLink, Maximize2 } from 'lucide-react';
import { useState } from 'react';
import { Reveal } from '@/components/motion/reveal';
import { DISTANCE, DURATION, STAGGER, staggerDelay } from '@/components/motion/tokens';
import { CloudImage } from '@/components/ui/cloud-image';
import { Lightbox, LightboxArrow, LightboxClose } from '@/components/ui/lightbox';
import { cloudinaryImage } from '@/lib/cloudinary';
import type { Certificate } from '@/lib/types';

const meta = (certificate: Certificate) =>
  [certificate.issuer, certificate.issuedAt].filter(Boolean).join(' · ');

function Medal({ size }: { size: 'sm' | 'lg' }) {
  return (
    <span
      aria-hidden
      className={`relative flex items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_28%,hsl(var(--brand-violet))_0%,hsl(var(--brand-indigo))_60%,hsl(260_45%_18%)_100%)] text-white ring-1 ring-white/15 transition-transform duration-500 ease-[var(--ease-premium)] group-hover:rotate-[6deg] group-hover:scale-105 ${
        size === 'lg'
          ? 'h-12 w-12 shadow-[0_10px_28px_-8px_hsl(var(--brand-violet)/0.55),inset_0_1px_0_hsl(0_0%_100%/0.28)]'
          : 'h-8 w-8 shadow-[0_6px_16px_-4px_hsl(var(--brand-violet)/0.55),inset_0_1px_0_hsl(0_0%_100%/0.28)]'
      }`}
    >
      <span className="absolute inset-[3px] rounded-full ring-[1.5px] ring-white/15" />
      <Award
        className={`relative drop-shadow-[0_2px_4px_hsl(220_40%_4%/0.6)] ${size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5'}`}
      />
    </span>
  );
}

function CertificateCard({
  certificate,
  onOpen,
}: {
  certificate: Certificate;
  onOpen: () => void;
}) {
  const fallback = (
    <span className="relative flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_45%,hsl(var(--brand-violet)/0.12),transparent_70%)]"
      />
      <Medal size="lg" />
      <span className="relative mt-0.5 text-[8px] font-bold uppercase tracking-[0.35em] text-brand-violet-soft">
        Certificate
      </span>
      <span
        aria-hidden
        className="relative h-px w-10 bg-gradient-to-r from-transparent via-brand-violet/55 to-transparent"
      />
      {certificate.issuer ? (
        <span className="relative line-clamp-1 max-w-[80%] text-[10px] text-[hsl(220_15%_72%)]">
          {certificate.issuer}
        </span>
      ) : null}
    </span>
  );

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View certificate: ${certificate.title}`}
      className="group glass-card card-sheen ring-conic glow-hover relative block w-full overflow-hidden rounded-xl text-left transition-[transform,box-shadow] duration-300 ease-[var(--ease-premium)] hover:-translate-y-1"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-brand-violet/70 to-transparent"
      />
      <span className="relative block aspect-[16/11] overflow-hidden bg-[radial-gradient(120%_80%_at_50%_-10%,hsl(var(--brand-violet)/0.18),transparent_55%),linear-gradient(180deg,hsl(225_30%_10%)_0%,hsl(225_35%_7%)_100%)] p-2">
        <span className="relative block h-full w-full overflow-hidden rounded-md bg-[hsl(225_30%_8%/0.55)] shadow-[inset_0_1px_0_hsl(0_0%_100%/0.04),inset_0_0_24px_hsl(220_40%_4%/0.45)] ring-1 ring-white/[0.08]">
          {certificate.imageUrl ? (
            <CloudImage
              src={certificate.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-[1.05]"
              fallback={fallback}
            />
          ) : (
            fallback
          )}
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[hsl(220_40%_4%/0.55)] via-[hsl(220_40%_4%/0.04)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <span className="absolute right-2 top-2 flex h-7 w-7 -translate-y-1 translate-x-1 items-center justify-center rounded-full border border-white/15 bg-[hsl(220_30%_8%/0.55)] text-white opacity-0 shadow-[0_6px_18px_-8px_hsl(220_40%_4%/0.6)] backdrop-blur-md transition-[transform,opacity,border-color,background-color] duration-300 ease-[var(--ease-premium)] group-hover:translate-x-0 group-hover:translate-y-0 group-hover:border-white/30 group-hover:bg-[hsl(220_30%_14%/0.75)] group-hover:opacity-100">
            <Maximize2 className="h-3 w-3" />
          </span>
          {certificate.imageUrl ? (
            <span className="pointer-events-none absolute bottom-2 right-2">
              <Medal size="sm" />
            </span>
          ) : null}
        </span>
      </span>

      <span className="relative block p-3">
        <span className="line-clamp-2 font-display text-[13.5px] font-semibold leading-tight tracking-tight text-[hsl(220_25%_94%)] transition-colors duration-300 group-hover:text-white">
          {certificate.title}
        </span>
        <span aria-hidden className="accent-underline mt-1.5" />
        {meta(certificate) ? (
          <span className="mt-1.5 line-clamp-1 text-[10.5px] text-[hsl(220_15%_72%)]">
            {meta(certificate)}
          </span>
        ) : null}
      </span>
    </button>
  );
}

/** Certificate cards; clicking one opens it full size with its details. */
export function CertificateGallery({ certificates }: { certificates: Certificate[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const count = certificates.length;
  const current = index === null ? null : certificates[index];
  const step = (delta: number) =>
    setIndex((value) => (value === null ? value : (value + delta + count) % count));

  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((certificate, i) => (
          <Reveal
            key={certificate._id}
            y={DISTANCE.md}
            duration={DURATION.moderate}
            delay={staggerDelay(i, STAGGER.tight)}
          >
            <CertificateCard certificate={certificate} onOpen={() => setIndex(i)} />
          </Reveal>
        ))}
      </div>

      <Lightbox
        open={current !== null}
        onClose={() => setIndex(null)}
        title={current?.title ?? 'Certificate'}
        onPrevious={count > 1 ? () => step(-1) : undefined}
        onNext={count > 1 ? () => step(1) : undefined}
      >
        {current ? (
          <div className="glass-card relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl">
            <LightboxClose className="bg-black/50 hover:bg-black/70" />
            {count > 1 ? (
              <>
                <LightboxArrow
                  direction="previous"
                  onClick={() => step(-1)}
                  className="left-4 h-10 w-10 bg-black/50 hover:bg-black/70 sm:left-4"
                />
                <LightboxArrow
                  direction="next"
                  onClick={() => step(1)}
                  className="right-4 h-10 w-10 bg-black/50 hover:bg-black/70 sm:right-4"
                />
              </>
            ) : null}

            {current.imageUrl ? (
              <div className="relative bg-black">
                {/* Full-size viewer; Cloudinary still serves a right-sized, modern-format file. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cloudinaryImage(current.imageUrl, 1800)}
                  alt={current.title}
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>
            ) : null}

            <div className="p-6">
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                {current.title}
              </h3>
              {meta(current) ? (
                <p className="mt-1 text-sm text-muted-foreground">{meta(current)}</p>
              ) : null}
              {current.description ? (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {current.description}
                </p>
              ) : null}
              {current.credentialUrl ? (
                <a
                  href={current.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-indigo hover:underline"
                >
                  Verify credential <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </Lightbox>
    </>
  );
}
