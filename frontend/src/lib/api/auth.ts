import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

export interface AdminUser {
  id: string;
  email: string;
}

export const meKey = ['auth', 'me'] as const;

export function useMe() {
  return useQuery({
    queryKey: meKey,
    queryFn: async () => {
      try {
        const { data } = await api.get<{ admin: AdminUser }>('/auth/me');
        return data.admin;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 30_000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data } = await api.post<{ admin: AdminUser }>('/auth/login', {
        email,
        password,
      });
      return data.admin;
    },
    onSuccess: (admin) => {
      qc.setQueryData(meKey, admin);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      qc.setQueryData(meKey, null);
    },
  });
}
