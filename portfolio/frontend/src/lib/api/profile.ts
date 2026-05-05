import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Profile } from '../types';

export const profileKey = ['profile'] as const;

export async function fetchProfile(): Promise<Profile> {
  const { data } = await api.get<Profile>('/profile');
  return data;
}

export function useProfile() {
  return useQuery({ queryKey: profileKey, queryFn: fetchProfile });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Profile>) => {
      const { data } = await api.put<Profile>('/profile', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKey });
    },
  });
}
