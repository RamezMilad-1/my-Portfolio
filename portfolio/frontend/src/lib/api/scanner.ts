import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import { projectsKeys } from './projects';
import type { ProposedProject, Project } from '../types';

export function useRunScan() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ProposedProject[]>('/scanner/run');
      return data;
    },
  });
}

export function useImportProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (folderName: string) => {
      const { data } = await api.post<Project>('/scanner/import', { folderName });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: projectsKeys.all }),
  });
}
