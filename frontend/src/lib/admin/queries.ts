'use client';

import {
  type UseMutationResult,
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type {
  AdminUser,
  Certificate,
  CertificateInput,
  ContactMessage,
  Media,
  Profile,
  ProfileInput,
  Project,
  ProjectInput,
  TeamMember,
  TeamMemberInput,
  TechItem,
  TechItemInput,
  TimelineEntry,
  TimelineEntryInput,
} from '@/lib/types';
import { useContentMutation } from './mutations';

export const queryKeys = {
  me: ['auth', 'me'],
  profile: ['profile'],
  projects: ['projects'],
  project: (id: string) => ['projects', id],
  media: ['media'],
  team: ['team'],
  messages: ['messages'],
} as const;

// ── Session ────────────────────────────────────────────────────────────────

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => (await api<{ admin: AdminUser }>('/auth/me')).admin,
    staleTime: 5 * 60_000,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api('/auth/logout', { method: 'POST' }),
    // Nothing from the signed-in session should survive in memory.
    onSettled: () => queryClient.clear(),
  });
}

// ── Profile ────────────────────────────────────────────────────────────────

export function useProfile() {
  return useQuery({ queryKey: queryKeys.profile, queryFn: () => api<Profile>('/profile') });
}

export function useUpdateProfile() {
  return useContentMutation(
    (input: ProfileInput) => api<Profile>('/profile', { method: 'PUT', body: input }),
    [queryKeys.profile],
  );
}

// ── Projects ───────────────────────────────────────────────────────────────

export function useProjects() {
  return useQuery({ queryKey: queryKeys.projects, queryFn: () => api<Project[]>('/projects/all') });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: () => api<Project>(`/projects/id/${id}`),
  });
}

export function useSaveProject() {
  return useContentMutation(
    ({ id, input }: { id?: string; input: ProjectInput }) =>
      id
        ? api<Project>(`/projects/${id}`, { method: 'PUT', body: input })
        : api<Project>('/projects', { method: 'POST', body: input }),
    [queryKeys.projects, queryKeys.media],
  );
}

export function useDeleteProject() {
  return useContentMutation(
    (id: string) => api(`/projects/${id}`, { method: 'DELETE' }),
    [queryKeys.projects],
  );
}

export function useReorderProjects() {
  return useContentMutation(
    (items: { id: string; position: number }[]) =>
      api('/projects/reorder', { method: 'PUT', body: { items } }),
    [queryKeys.projects],
  );
}

// ── Team ───────────────────────────────────────────────────────────────────

export function useTeam() {
  return useQuery({ queryKey: queryKeys.team, queryFn: () => api<TeamMember[]>('/team') });
}

export function useSaveTeamMember() {
  return useContentMutation(
    ({ id, input }: { id?: string; input: TeamMemberInput }) =>
      id
        ? api<TeamMember>(`/team/${id}`, { method: 'PUT', body: input })
        : api<TeamMember>('/team', { method: 'POST', body: input }),
    // Projects embed their collaborators.
    [queryKeys.team, queryKeys.projects],
  );
}

export function useDeleteTeamMember() {
  return useContentMutation(
    (id: string) => api(`/team/${id}`, { method: 'DELETE' }),
    [queryKeys.team, queryKeys.projects],
  );
}

// ── Messages ───────────────────────────────────────────────────────────────

export function useMessages() {
  return useQuery({
    queryKey: queryKeys.messages,
    queryFn: () => api<ContactMessage[]>('/messages'),
  });
}

export function useSetMessageRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) =>
      api<ContactMessage>(`/messages/${id}`, { method: 'PATCH', body: { read } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.messages }),
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/messages/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.messages }),
  });
}

// ── Media ──────────────────────────────────────────────────────────────────

export function useMediaLibrary() {
  return useQuery({ queryKey: queryKeys.media, queryFn: () => api<Media[]>('/media') });
}

export function useUpdateMediaCaption() {
  return useContentMutation(
    ({ id, caption }: { id: string; caption: string }) =>
      api<Media>(`/media/${id}`, { method: 'PATCH', body: { caption } }),
    // Projects embed their media captions.
    [queryKeys.media, queryKeys.projects],
  );
}

export function useDeleteMedia() {
  return useContentMutation(
    (id: string) => api(`/media/${id}`, { method: 'DELETE' }),
    [queryKeys.media],
  );
}

// ── Certificates, timeline, tech ───────────────────────────────────────────

/** List / read / save / delete hooks for one of the simple ordered collections. */
function collection<T extends { _id: string }, Input>(name: 'certificates' | 'timeline' | 'tech') {
  const key = [name] as const;
  return {
    useList: () => useQuery({ queryKey: key, queryFn: () => api<T[]>(`/${name}/all`) }),
    useItem: (id: string) =>
      useQuery({ queryKey: [...key, id], queryFn: () => api<T>(`/${name}/${id}`) }),
    useSave: () =>
      useContentMutation(
        ({ id, input }: { id?: string; input: Input }) =>
          id
            ? api<T>(`/${name}/${id}`, { method: 'PUT', body: input })
            : api<T>(`/${name}`, { method: 'POST', body: input }),
        [key],
      ),
    useRemove: () =>
      useContentMutation((id: string) => api(`/${name}/${id}`, { method: 'DELETE' }), [key]),
  };
}

/** What a collection list page needs: the list and a delete mutation. */
export interface CollectionHooks<T> {
  useList: () => UseQueryResult<T[]>;
  useRemove: () => UseMutationResult<unknown, Error, string>;
}

export const certificatesCollection = collection<Certificate, CertificateInput>('certificates');
export const timelineCollection = collection<TimelineEntry, TimelineEntryInput>('timeline');
export const techCollection = collection<TechItem, TechItemInput>('tech');
