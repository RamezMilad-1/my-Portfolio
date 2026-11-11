'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api/client';
import type { Media, MediaKind } from '@/lib/types';
import { queryKeys } from './queries';

/** File-picker filters. The API enforces the real rules (types and size limits). */
export const ACCEPT = {
  images: 'image/png,image/jpeg,image/webp,image/gif,image/avif',
  media:
    'image/png,image/jpeg,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime',
  document: 'application/pdf,image/png,image/jpeg,image/webp',
  any: 'image/png,image/jpeg,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime,application/pdf',
} as const;

interface UploadTicket {
  uploadUrl: string;
  fields: Record<string, string>;
  kind: MediaKind;
}

/** POSTs the form to Cloudinary, reporting upload progress (0–100). */
function sendToCloudinary(
  url: string,
  form: FormData,
  onProgress: (percent: number) => void,
): Promise<{ public_id: string }> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', url);
    request.responseType = 'json';
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      const body = request.response as { public_id?: string; error?: { message?: string } } | null;
      if (request.status >= 200 && request.status < 300 && body?.public_id) {
        resolve({ public_id: body.public_id });
      } else {
        reject(new Error(body?.error?.message ?? `Upload failed (${request.status})`));
      }
    };
    request.onerror = () => reject(new Error('Upload failed — check your connection'));
    request.send(form);
  });
}

/**
 * Uploads a file straight from the browser to Cloudinary with a one-off signed ticket, then
 * registers it in the media library. The API never handles the file itself.
 */
async function uploadMedia(
  file: File,
  options: { projectId?: string; caption?: string; onProgress: (percent: number) => void },
): Promise<Media> {
  const ticket = await api<UploadTicket>('/media/upload-ticket', {
    method: 'POST',
    body: { mimeType: file.type, size: file.size },
  });
  const form = new FormData();
  for (const [key, value] of Object.entries(ticket.fields)) form.append(key, value);
  form.append('file', file);
  const { public_id } = await sendToCloudinary(ticket.uploadUrl, form, options.onProgress);
  return api<Media>('/media', {
    method: 'POST',
    body: {
      publicId: public_id,
      kind: ticket.kind,
      originalName: file.name,
      caption: options.caption,
      projectId: options.projectId,
    },
  });
}

/** Upload with progress state; refreshes the media library afterwards. */
export function useUpload() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<number | null>(null);

  const upload = async (file: File, options: { projectId?: string; caption?: string } = {}) => {
    setProgress(0);
    try {
      return await uploadMedia(file, { ...options, onProgress: setProgress });
    } finally {
      setProgress(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.media });
    }
  };

  return { upload, progress, uploading: progress !== null };
}
