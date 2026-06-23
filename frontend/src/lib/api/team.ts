import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { TeamMember } from '../types';

export const teamKey = ['team'] as const;

export async function fetchTeam(): Promise<TeamMember[]> {
  const { data } = await api.get<TeamMember[]>('/team');
  return data;
}

export function useTeam() {
  return useQuery({ queryKey: teamKey, queryFn: fetchTeam });
}

export function useCreateTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<TeamMember>) => {
      const { data } = await api.post<TeamMember>('/team', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKey }),
  });
}

export function useUpdateTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<TeamMember> }) => {
      const { data } = await api.put<TeamMember>(`/team/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKey }),
  });
}

export function useDeleteTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/team/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKey }),
  });
}
