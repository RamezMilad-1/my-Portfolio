import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Project } from '../types';

export const projectsKeys = {
  all: ['projects'] as const,
  list: () => ['projects', 'list'] as const,
  listAll: () => ['projects', 'list-all'] as const,
  bySlug: (slug: string) => ['projects', 'slug', slug] as const,
  byId: (id: string) => ['projects', 'id', id] as const,
};

export async function fetchProjectsPublic(): Promise<Project[]> {
  const { data } = await api.get<Project[]>('/projects');
  return data;
}
export async function fetchProjectsAll(): Promise<Project[]> {
  const { data } = await api.get<Project[]>('/projects/all');
  return data;
}
export async function fetchProjectBySlug(slug: string): Promise<Project> {
  const { data } = await api.get<Project>(`/projects/${slug}`);
  return data;
}
export async function fetchProjectById(id: string): Promise<Project> {
  const { data } = await api.get<Project>(`/projects/id/${id}`);
  return data;
}

export function useProjectsPublic() {
  return useQuery({ queryKey: projectsKeys.list(), queryFn: fetchProjectsPublic });
}
export function useProjectsAll() {
  return useQuery({ queryKey: projectsKeys.listAll(), queryFn: fetchProjectsAll });
}
export function useProject(slug: string) {
  return useQuery({
    queryKey: projectsKeys.bySlug(slug),
    queryFn: () => fetchProjectBySlug(slug),
    enabled: !!slug,
  });
}
export function useProjectById(id: string) {
  return useQuery({
    queryKey: projectsKeys.byId(id),
    queryFn: () => fetchProjectById(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Project>) => {
      const { data } = await api.post<Project>('/projects', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectsKeys.all });
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Project> }) => {
      const { data } = await api.put<Project>(`/projects/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectsKeys.all });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectsKeys.all });
    },
  });
}

export function useReorderProjects() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: Array<{ id: string; position: number }>) => {
      await api.put('/projects/reorder', { items });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectsKeys.all });
    },
  });
}
