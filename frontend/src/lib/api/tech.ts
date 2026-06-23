import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { TechItem, TechItemInput } from '../types';

export const techKeys = {
  all: ['tech'] as const,
  list: () => ['tech', 'list'] as const,
  listAll: () => ['tech', 'list-all'] as const,
  byId: (id: string) => ['tech', 'id', id] as const,
};

export async function fetchTechPublic(): Promise<TechItem[]> {
  const { data } = await api.get<TechItem[]>('/tech');
  return data;
}
export async function fetchTechAll(): Promise<TechItem[]> {
  const { data } = await api.get<TechItem[]>('/tech/all');
  return data;
}
export async function fetchTechById(id: string): Promise<TechItem> {
  const { data } = await api.get<TechItem>(`/tech/${id}`);
  return data;
}

export function useTechPublic() {
  return useQuery({
    queryKey: techKeys.list(),
    queryFn: fetchTechPublic,
  });
}
export function useTechAll() {
  return useQuery({
    queryKey: techKeys.listAll(),
    queryFn: fetchTechAll,
  });
}
export function useTechById(id: string) {
  return useQuery({
    queryKey: techKeys.byId(id),
    queryFn: () => fetchTechById(id),
    enabled: !!id,
  });
}

export function useCreateTechItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TechItemInput) => {
      const { data } = await api.post<TechItem>('/tech', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: techKeys.all });
    },
  });
}

export function useUpdateTechItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: TechItemInput;
    }) => {
      const { data } = await api.put<TechItem>(`/tech/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: techKeys.all });
    },
  });
}

export function useDeleteTechItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tech/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: techKeys.all });
    },
  });
}
