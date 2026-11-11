'use client';

import { Loader2, Upload } from 'lucide-react';
import { type ChangeEvent, useId } from 'react';
import { toast } from 'sonner';
import { useUpload } from '@/lib/admin/upload';
import { errorMessage } from '@/lib/api/client';
import type { Media } from '@/lib/types';
import { cn } from '@/lib/utils';

interface UploadButtonProps {
  accept: string;
  label?: string;
  multiple?: boolean;
  projectId?: string;
  onUploaded?: (media: Media) => void;
  className?: string;
}

/** Picks file(s) and uploads them straight to Cloudinary, showing progress. */
export function UploadButton({
  accept,
  label = 'Upload',
  multiple = false,
  projectId,
  onUploaded,
  className,
}: UploadButtonProps) {
  const inputId = useId();
  const { upload, progress, uploading } = useUpload();

  const onChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    for (const file of files) {
      try {
        const media = await upload(file, { projectId });
        toast.success(`Uploaded ${file.name}`);
        onUploaded?.(media);
      } catch (error) {
        toast.error(`${file.name}: ${errorMessage(error, 'upload failed')}`);
      }
    }
  };

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-muted focus-within:ring-2 focus-within:ring-ring',
        uploading && 'pointer-events-none opacity-70',
        className,
      )}
    >
      {uploading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Upload className="h-3.5 w-3.5" />
      )}
      {uploading ? `Uploading… ${progress}%` : label}
      <input
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={uploading}
        onChange={onChange}
        className="sr-only"
      />
    </label>
  );
}
