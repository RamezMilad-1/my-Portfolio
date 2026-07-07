import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Media } from '../types';

export const mediaKey = ['media'] as const;

export function useMediaList() {
  return useQuery({
    queryKey: mediaKey,
    queryFn: async () => (await api.get<Media[]>('/media')).data,
  });
}

export function useUploadMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      projectId,
      caption,
    }: {
      file: File;
      projectId?: string;
      caption?: string;
    }) => {
      const fd = new FormData();
      fd.append('file', file);
      if (projectId) fd.append('projectId', projectId);
      if (caption) fd.append('caption', caption);
      const { data } = await api.post<Media>('/media', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaKey }),
  });
}

export function useUpdateMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, caption }: { id: string; caption: string }) => {
      const { data } = await api.patch<Media>(`/media/${id}`, { caption });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mediaKey });
      // Project queries embed populated media, so their captions are stale too.
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/media/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaKey }),
  });
}
