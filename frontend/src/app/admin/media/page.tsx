'use client';

import { Check, Copy, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { MediaThumb } from '@/components/admin/media-thumb';
import { PageHeader } from '@/components/admin/page-header';
import { UploadButton } from '@/components/admin/upload-button';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { formatBytes } from '@/lib/admin/format';
import { useDeleteMedia, useMediaLibrary, useProjects } from '@/lib/admin/queries';
import { ACCEPT } from '@/lib/admin/upload';
import { errorMessage } from '@/lib/api/client';
import type { Media } from '@/lib/types';

const KIND_LABELS = { image: 'Image', video: 'Video', raw: 'PDF' } as const;

function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy the link');
    }
  };
  return (
    <Button type="button" variant="ghost" size="icon-sm" onClick={copy} aria-label="Copy link">
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

export default function AdminMediaPage() {
  const { data: media, isLoading } = useMediaLibrary();
  const { data: projects } = useProjects();
  const remove = useDeleteMedia();
  const [pendingDelete, setPendingDelete] = useState<Media | null>(null);
  const projectNames = new Map(projects?.map((project) => [project._id, project.name]));

  const onDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync(pendingDelete._id);
      toast.success('Deleted');
      setPendingDelete(null);
    } catch (error) {
      // 409 explains where the file is still used.
      toast.error(errorMessage(error, 'Could not delete'));
      setPendingDelete(null);
    }
  };

  const upload = <UploadButton accept={ACCEPT.any} multiple label="Upload files" />;

  return (
    <div>
      <PageHeader
        title="Media library"
        description="Images, videos and PDFs stored on Cloudinary. Attach them to projects, your profile or certificates."
        action={upload}
      />

      {isLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }, (_, index) => (
            <Skeleton key={index} className="aspect-[4/3] rounded-lg" />
          ))}
        </div>
      ) : (media ?? []).length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={ImageIcon}
          title="Your media library is empty"
          description="Upload project screenshots, short videos, your photo and your CV."
          action={upload}
        />
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {media?.map((item) => (
            <li key={item._id} className="overflow-hidden rounded-lg border border-border bg-card">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open the file"
              >
                <MediaThumb
                  kind={item.kind}
                  url={item.url}
                  alt={item.caption}
                  className="aspect-video w-full"
                />
              </a>
              <div className="space-y-1 p-2">
                <p className="truncate text-xs font-medium" title={item.originalName}>
                  {item.originalName || item.caption || 'Untitled'}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {KIND_LABELS[item.kind]} · {formatBytes(item.sizeBytes)}
                  {item.projectId && projectNames.get(item.projectId)
                    ? ` · ${projectNames.get(item.projectId)}`
                    : ''}
                </p>
                <div className="flex justify-end gap-1">
                  <CopyUrlButton url={item.url} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setPendingDelete(item)}
                    aria-label={`Delete ${item.originalName || 'file'}`}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this file?"
        description={`“${pendingDelete?.originalName || 'This file'}” is removed from Cloudinary for good. Files still shown somewhere on the site can't be deleted until you remove them there.`}
        confirmLabel="Delete"
        destructive
        onConfirm={onDelete}
      />
    </div>
  );
}
