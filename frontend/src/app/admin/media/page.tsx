'use client';

import { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useMediaList, useUploadMedia, useDeleteMedia } from '@/lib/api/media';
import { uploadsUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { Media } from '@/lib/types';

export default function AdminMediaPage() {
  const { data: media } = useMediaList();
  const upload = useUploadMedia();
  const del = useDeleteMedia();
  const [pendingDelete, setPendingDelete] = useState<Media | null>(null);

  const onUpload = async (file: File) => {
    try {
      await upload.mutateAsync({ file });
      toast.success('Uploaded');
    } catch {
      toast.error('Upload failed');
    }
  };

  const onDelete = async () => {
    if (!pendingDelete) return;
    try {
      await del.mutateAsync(pendingDelete._id);
      toast.success('Deleted');
      setPendingDelete(null);
    } catch {
      toast.error('Could not delete');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Admin</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Media library</h1>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[hsl(var(--accent))] px-4 py-2 text-sm font-medium text-[hsl(var(--accent-foreground))] hover:opacity-90">
          <Plus className="h-4 w-4" /> Upload
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) await onUpload(file);
              e.target.value = '';
            }}
          />
        </label>
      </div>

      {(media ?? []).length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={ImageIcon}
          title="Your media library is empty"
          description="Upload screenshots and short videos of your projects, your avatar, and your resume here. Files become available everywhere — project galleries, profile, etc."
          action={
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[hsl(var(--accent))] px-4 py-2 text-sm font-medium text-[hsl(var(--accent-foreground))] hover:opacity-90">
              <Plus className="h-4 w-4" /> Upload your first file
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) await onUpload(file);
                  e.target.value = '';
                }}
              />
            </label>
          }
        />
      ) : null}

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {(media ?? []).map((m) => (
          <div
            key={m._id}
            className="group relative overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
          >
            <div className="relative aspect-video overflow-hidden bg-[hsl(var(--muted))]">
              {m.kind === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={uploadsUrl(m.url)} alt={m.caption || ''} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-black/80 text-xs text-white">
                  VIDEO
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="truncate text-xs">{m.originalName || m.caption || m.url}</p>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                {(m.sizeBytes ? `${Math.round(m.sizeBytes / 1024)} KB` : '—') + ' · ' + m.kind}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPendingDelete(m)}
              className="absolute right-1 top-1 hidden bg-black/70 text-white hover:bg-black/90 group-hover:flex"
              aria-label="Delete media"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this media file?"
        description={
          pendingDelete?.originalName
            ? `"${pendingDelete.originalName}" will be permanently removed from your library and from any project gallery using it.`
            : 'This file will be permanently removed from your library.'
        }
        confirmLabel="Delete"
        destructive
        onConfirm={onDelete}
      />
    </div>
  );
}
