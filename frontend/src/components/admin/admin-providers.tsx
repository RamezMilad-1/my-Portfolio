'use client';

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { type ReactNode, useState } from 'react';
import { Toaster } from 'sonner';
import { ApiError } from '@/lib/api/client';

const isUnauthorized = (error: unknown) => error instanceof ApiError && error.status === 401;

/** Data fetching and toasts exist only inside the dashboard, never on the public site. */
export function AdminProviders({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [queryClient] = useState(() => {
    // An expired session sends the admin back to sign in, then returns them here.
    const onError = (error: unknown) => {
      if (!isUnauthorized(error)) return;
      const { pathname, search } = window.location;
      router.replace(`/login?next=${encodeURIComponent(pathname + search)}`);
    };

    return new QueryClient({
      queryCache: new QueryCache({ onError }),
      mutationCache: new MutationCache({ onError }),
      defaultOptions: {
        queries: {
          staleTime: 30_000,
          refetchOnWindowFocus: false,
          // Client errors (404, 401…) won't succeed on a retry.
          retry: (failures, error) =>
            !(error instanceof ApiError && error.status < 500) && failures < 1,
        },
      },
    });
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" closeButton theme="dark" />
    </QueryClientProvider>
  );
}
