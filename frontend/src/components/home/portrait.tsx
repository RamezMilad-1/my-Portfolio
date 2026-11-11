import { CloudImage } from '@/components/ui/cloud-image';

/** Profile photo with an initials fallback (also used if the photo fails to load). */
export function Portrait({ src, alt, initials }: { src: string; alt: string; initials: string }) {
  const fallback = (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-indigo/10 to-brand-violet-soft/10">
      <span className="font-display text-6xl font-bold tracking-tight">
        <span className="text-brand-gradient">{initials}</span>
      </span>
    </div>
  );

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[11rem] sm:max-w-[13rem]">
      <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-brand-indigo/22 to-brand-violet-soft/22 opacity-70 blur-2xl" />
      <div className="glass-card relative h-full w-full overflow-hidden rounded-3xl">
        {src ? (
          <CloudImage
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 640px) 13rem, 11rem"
            className="object-cover"
            fallback={fallback}
          />
        ) : (
          fallback
        )}
      </div>
    </div>
  );
}
