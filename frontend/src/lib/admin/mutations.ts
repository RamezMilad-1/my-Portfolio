'use client';

import { type QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Drops the cached public pages after a content change (see `app/api/revalidate`). If it fails,
 * the pages still refresh on their own within a few minutes.
 */
export async function refreshPublicSite(): Promise<void> {
  try {
    await fetch('/api/revalidate', { method: 'POST', credentials: 'same-origin' });
  } catch (error) {
    console.warn('Could not refresh the public site cache', error);
  }
}

/**
 * A mutation that changes site content: on success it invalidates the given admin queries and
 * refreshes the public site, so both show the change immediately.
 */
export function useContentMutation<TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidate: QueryKey[],
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      await refreshPublicSite();
    },
  });
}
