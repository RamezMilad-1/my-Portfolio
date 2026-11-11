'use client';

import type { LucideIcon } from 'lucide-react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { CollectionHooks } from '@/lib/admin/queries';
import { errorMessage } from '@/lib/api/client';
import { PageHeader } from './page-header';

export interface Column<T> {
  header: string;
  cell: (item: T) => ReactNode;
  className?: string;
}

interface CollectionPageProps<T extends { _id: string }> {
  collection: CollectionHooks<T>;
  title: string;
  description: string;
  /** Base path; items link to `${basePath}/${id}` and "New" to `${basePath}/new`. */
  basePath: string;
  newLabel: string;
  columns: Column<T>[];
  /** Used in the delete confirmation. */
  itemLabel: (item: T) => string;
  empty: { icon: LucideIcon; title: string; description: string };
  /** Extra content between the header and the table. */
  children?: ReactNode;
}

/** Admin list page for the simple ordered collections (certificates, timeline, tech). */
export function CollectionPage<T extends { _id: string; position: number }>({
  collection,
  title,
  description,
  basePath,
  newLabel,
  columns,
  itemLabel,
  empty,
  children,
}: CollectionPageProps<T>) {
  const { data, isLoading } = collection.useList();
  const remove = collection.useRemove();
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);
  const items = [...(data ?? [])].sort((a, b) => a.position - b.position);

  const onDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync(pendingDelete._id);
      toast.success(`Deleted “${itemLabel(pendingDelete)}”`);
      setPendingDelete(null);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not delete'));
    }
  };

  const newButton = (
    <Button asChild>
      <Link href={`${basePath}/new`}>
        <Plus className="h-4 w-4" /> {newLabel}
      </Link>
    </Button>
  );

  return (
    <div>
      <PageHeader title={title} description={description} action={newButton} />
      {children ? <div className="mt-8">{children}</div> : null}

      <div className="relative mt-6 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              {columns.map((column) => (
                <th key={column.header} scope="col" className="p-3">
                  {column.header}
                </th>
              ))}
              <th scope="col" className="p-3 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 3 }, (_, row) => (
                <tr key={row}>
                  {columns.map((column) => (
                    <td key={column.header} className="p-3">
                      <Skeleton className="h-5 w-28" />
                    </td>
                  ))}
                  <td className="p-3">
                    <Skeleton className="ml-auto h-7 w-16" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-0">
                  <EmptyState
                    className="m-4 border-0"
                    icon={empty.icon}
                    title={empty.title}
                    description={empty.description}
                    action={newButton}
                  />
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="hover:bg-muted/40">
                  {columns.map((column) => (
                    <td key={column.header} className={column.className ?? 'p-3'}>
                      {column.cell(item)}
                    </td>
                  ))}
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button asChild size="sm" variant="ghost">
                        <Link
                          href={`${basePath}/${item._id}`}
                          aria-label={`Edit “${itemLabel(item)}”`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPendingDelete(item)}
                        aria-label={`Delete “${itemLabel(item)}”`}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete “${pendingDelete ? itemLabel(pendingDelete) : ''}”?`}
        description="This permanently removes it from the site. Files in your media library are not affected."
        confirmLabel="Delete"
        destructive
        onConfirm={onDelete}
      />
    </div>
  );
}
