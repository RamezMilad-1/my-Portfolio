import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { ContactMessage, ContactMessageInput } from '../types';

export const messageKeys = {
  all: ['messages'] as const,
  list: () => ['messages', 'list'] as const,
};

export function useSendMessage() {
  return useMutation({
    mutationFn: async (payload: ContactMessageInput) => {
      const { data } = await api.post<ContactMessage>('/messages', payload);
      return data;
    },
  });
}

export function useMessages() {
  return useQuery({
    queryKey: messageKeys.list(),
    queryFn: async () => {
      const { data } = await api.get<ContactMessage[]>('/messages');
      return data;
    },
  });
}

export function useDeleteMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/messages/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messageKeys.all });
    },
  });
}
