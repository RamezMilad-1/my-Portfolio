import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { TimelineEntry, TimelineEntryInput } from '../types';

export const timelineKeys = {
  all: ['timeline'] as const,
  list: () => ['timeline', 'list'] as const,
  listAll: () => ['timeline', 'list-all'] as const,
  byId: (id: string) => ['timeline', 'id', id] as const,
};

export async function fetchTimelinePublic(): Promise<TimelineEntry[]> {
  const { data } = await api.get<TimelineEntry[]>('/timeline');
  return data;
}
export async function fetchTimelineAll(): Promise<TimelineEntry[]> {
  const { data } = await api.get<TimelineEntry[]>('/timeline/all');
  return data;
}
export async function fetchTimelineById(id: string): Promise<TimelineEntry> {
  const { data } = await api.get<TimelineEntry>(`/timeline/${id}`);
  return data;
}

export function useTimelinePublic() {
  return useQuery({
    queryKey: timelineKeys.list(),
    queryFn: fetchTimelinePublic,
  });
}
export function useTimelineAll() {
  return useQuery({
    queryKey: timelineKeys.listAll(),
    queryFn: fetchTimelineAll,
  });
}
export function useTimelineById(id: string) {
  return useQuery({
    queryKey: timelineKeys.byId(id),
    queryFn: () => fetchTimelineById(id),
    enabled: !!id,
  });
}

export function useCreateTimelineEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TimelineEntryInput) => {
      const { data } = await api.post<TimelineEntry>('/timeline', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: timelineKeys.all });
    },
  });
}

export function useUpdateTimelineEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: TimelineEntryInput;
    }) => {
      const { data } = await api.put<TimelineEntry>(
        `/timeline/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: timelineKeys.all });
    },
  });
}

export function useDeleteTimelineEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/timeline/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: timelineKeys.all });
    },
  });
}
