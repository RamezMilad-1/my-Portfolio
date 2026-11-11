import { FileText, Play } from 'lucide-react';
import { cloudinaryImage, cloudinaryVideoPoster } from '@/lib/cloudinary';
import type { MediaKind } from '@/lib/types';
import { cn } from '@/lib/utils';

/** Small preview of a media item: image, video still with a play badge, or a document icon. */
export function MediaThumb({
  kind,
  url,
  alt = '',
  width = 320,
  className,
}: {
  kind: MediaKind;
  url: string;
  alt?: string;
  width?: number;
  className?: string;
}) {
  if (kind === 'raw') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-1 bg-muted', className)}>
        <FileText className="h-6 w-6 text-muted-foreground" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          PDF
        </span>
      </div>
    );
  }

  const src = kind === 'video' ? cloudinaryVideoPoster(url, width) : cloudinaryImage(url, width);
  return (
    <div className={cn('relative bg-muted', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
      {kind === 'video' ? (
        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Play aria-label="Video" className="h-6 w-6 fill-white text-white" />
        </span>
      ) : null}
    </div>
  );
}
