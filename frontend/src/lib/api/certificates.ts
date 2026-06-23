import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Certificate, CertificateInput } from '../types';

export const certificatesKeys = {
  all: ['certificates'] as const,
  list: () => ['certificates', 'list'] as const,
  listAll: () => ['certificates', 'list-all'] as const,
  byId: (id: string) => ['certificates', 'id', id] as const,
};

export async function fetchCertificatesPublic(): Promise<Certificate[]> {
  const { data } = await api.get<Certificate[]>('/certificates');
  return data;
}
export async function fetchCertificatesAll(): Promise<Certificate[]> {
  const { data } = await api.get<Certificate[]>('/certificates/all');
  return data;
}
export async function fetchCertificateById(id: string): Promise<Certificate> {
  const { data } = await api.get<Certificate>(`/certificates/${id}`);
  return data;
}

export function useCertificatesPublic() {
  return useQuery({
    queryKey: certificatesKeys.list(),
    queryFn: fetchCertificatesPublic,
  });
}
export function useCertificatesAll() {
  return useQuery({
    queryKey: certificatesKeys.listAll(),
    queryFn: fetchCertificatesAll,
  });
}
export function useCertificateById(id: string) {
  return useQuery({
    queryKey: certificatesKeys.byId(id),
    queryFn: () => fetchCertificateById(id),
    enabled: !!id,
  });
}

export function useCreateCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CertificateInput) => {
      const { data } = await api.post<Certificate>('/certificates', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: certificatesKeys.all });
    },
  });
}

export function useUpdateCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: CertificateInput;
    }) => {
      const { data } = await api.put<Certificate>(
        `/certificates/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: certificatesKeys.all });
    },
  });
}

export function useDeleteCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/certificates/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: certificatesKeys.all });
    },
  });
}
