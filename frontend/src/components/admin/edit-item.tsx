'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import { FileQuestion, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { errorMessage } from '@/lib/api/client';
import { PageHeader } from './page-header';

interface EditItemProps<T> {
  query: UseQueryResult<T>;
  back: { href: string; label: string };
  title: (item: T) => string;
  children: (item: T) => ReactNode;
}

/** Loads one item, then renders its edit form; handles the loading and not-found states. */
export function EditItem<T>({ query, back, title, children }: EditItemProps<T>) {
  const { data, isLoading, error } = query;

  return (
    <div>
      <PageHeader back={back} title={data ? title(data) : isLoading ? 'Loading…' : 'Not found'} />
      <div className="mt-8">
        {isLoading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </p>
        ) : data ? (
          children(data)
        ) : (
          <EmptyState
            icon={FileQuestion}
            title="This item couldn't be loaded"
            description={errorMessage(error, 'It may have been deleted.')}
          />
        )}
      </div>
    </div>
  );
}
