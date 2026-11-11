'use client';

import { ArrowDown, ArrowUp, ImagePlus, Star, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMediaLibrary, useUpdateMediaCaption } from '@/lib/admin/queries';
import { ACCEPT } from '@/lib/admin/upload';
import { errorMessage } from '@/lib/api/client';
import type { Media } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MediaThumb } from '../media-thumb';
import { UploadButton } from '../upload-button';

interface ProjectMediaFieldProps {
  /** Ordered media ids of the gallery. */
  value: string[];
  onChange: (ids: string[]) => void;
  cover: string;
  onCoverChange: (url: string) => void;
  projectId?: string;
}

/** Caption input that saves to the media item when it loses focus. */
function CaptionInput({ media }: { media: Media }) {
  const update = useUpdateMediaCaption();
  return (
    <Input
      key={media.caption}
      defaultValue={media.caption}
      placeholder="Caption shown under the image…"
      aria-label={`Caption for ${media.originalName || 'this item'}`}
      maxLength={300}
      className="h-9 text-xs"
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      onBlur={(event) => {
        const caption = event.target.value.trim();
        if (caption === media.caption) return;
        update.mutate(
          { id: media._id, caption },
          {
            onSuccess: () => toast.success('Caption saved'),
            onError: (error) => toast.error(errorMessage(error, 'Could not save the caption')),
          },
        );
      }}
    />
  );
}

/**
 * The project's gallery (ordered images and videos with captions) and its cover image.
 * Files come from the media library or are uploaded here.
 */
export function ProjectMediaField({
  value,
  onChange,
  cover,
  onCoverChange,
  projectId,
}: ProjectMediaFieldProps) {
  const { data: library = [] } = useMediaLibrary();
  const [picking, setPicking] = useState(false);
  const byId = new Map(library.map((media) => [media._id, media]));
  const selected = value.map((id) => byId.get(id)).filter((media) => media !== undefined);
  const available = library.filter((media) => media.kind !== 'raw' && !value.includes(media._id));

  const move = (index: number, delta: number) => {
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border p-3">
        {cover ? (
          <MediaThumb
            kind="image"
            url={cover}
            className="aspect-video w-32 overflow-hidden rounded-md"
          />
        ) : (
          <div className="flex aspect-video w-32 items-center justify-center rounded-md border border-dashed border-border text-center text-[10px] text-muted-foreground">
            First gallery image
          </div>
        )}
        <div className="flex-1 text-sm">
          <p className="font-medium">Cover image</p>
          <p className="text-xs text-muted-foreground">
            Shown on the project card and in link previews. Without one, the first gallery image is
            used.
          </p>
        </div>
        <div className="flex gap-2">
          <UploadButton
            accept={ACCEPT.images}
            label="Upload cover"
            projectId={projectId}
            onUploaded={(media) => onCoverChange(media.url)}
          />
          {cover ? (
            <Button type="button" variant="outline" size="sm" onClick={() => onCoverChange('')}>
              <X className="h-3.5 w-3.5" /> Remove
            </Button>
          ) : null}
        </div>
      </div>

      {selected.length > 0 ? (
        <ol className="space-y-2">
          {selected.map((media, index) => (
            <li
              key={media._id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-2 sm:flex-nowrap"
            >
              <MediaThumb
                kind={media.kind}
                url={media.url}
                className="aspect-video w-24 flex-shrink-0 overflow-hidden rounded-md"
              />
              <div className="min-w-0 flex-1">
                <CaptionInput media={media} />
              </div>
              <div className="flex flex-shrink-0 gap-1">
                {media.kind === 'image' ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onCoverChange(media.url)}
                    aria-label="Use as cover"
                    title="Use as cover"
                    className={cn(cover === media.url && 'text-yellow-400')}
                  >
                    <Star className={cn('h-3.5 w-3.5', cover === media.url && 'fill-current')} />
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => move(index, 1)}
                  disabled={index === selected.length - 1}
                  aria-label="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onChange(value.filter((id) => id !== media._id))}
                  aria-label="Remove from gallery"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">No gallery items yet.</p>
      )}

      <div className="flex flex-wrap gap-2">
        <UploadButton
          accept={ACCEPT.media}
          label="Upload to gallery"
          multiple
          projectId={projectId}
          onUploaded={(media) => onChange([...value, media._id])}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-expanded={picking}
          onClick={() => setPicking((open) => !open)}
          disabled={available.length === 0}
        >
          <ImagePlus className="h-3.5 w-3.5" /> Add from library
        </Button>
      </div>

      {picking && available.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {available.map((media) => (
            <li key={media._id}>
              <button
                type="button"
                onClick={() => onChange([...value, media._id])}
                aria-label={`Add ${media.originalName || 'item'} to the gallery`}
                className="block w-full overflow-hidden rounded-md border border-border transition hover:border-accent hover:ring-2 hover:ring-accent"
              >
                <MediaThumb kind={media.kind} url={media.url} className="aspect-video w-full" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
