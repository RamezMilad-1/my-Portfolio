'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Code2,
  EyeOff,
} from 'lucide-react';
import { useTechAll, useDeleteTechItem } from '@/lib/api/tech';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { TechItem } from '@/lib/types';

export default function AdminTechPage() {
  const { data, isLoading } = useTechAll();
  const del = useDeleteTechItem();
  const [pendingDelete, setPendingDelete] = useState<TechItem | null>(null);

  const onDelete = async () => {
    if (!pendingDelete) return;
    try {
      await del.mutateAsync(pendingDelete._id);
      toast.success('Tech item deleted');
      setPendingDelete(null);
    } catch {
      toast.error('Could not delete');
    }
  };

  const items = (data ?? []).slice().sort((a, b) => a.position - b.position);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Admin</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Tech stack
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Manage the entries shown under the Portfolio → Tech Stack tab. If
            you don&apos;t add any, the site auto-derives the list from your
            project tech arrays.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/tech/new">
            <Plus className="h-4 w-4" /> New tech item
          </Link>
        </Button>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-[hsl(var(--border))]">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--muted))]/50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Position</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td className="p-3">
                    <Skeleton className="h-5 w-32" />
                  </td>
                  <td className="p-3">
                    <Skeleton className="h-5 w-10" />
                  </td>
                  <td className="p-3">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </td>
                  <td className="p-3 text-right">
                    <Skeleton className="ml-auto h-7 w-16" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-0">
                  <EmptyState
                    className="m-4 border-0 border-dashed-0"
                    icon={Code2}
                    title="No tech items yet"
                    description="The public Tech Stack tab is currently auto-derived from your projects. Add entries here to take full control of the list and ordering."
                    action={
                      <Button asChild>
                        <Link href="/admin/tech/new">
                          <Plus className="h-4 w-4" /> New tech item
                        </Link>
                      </Button>
                    }
                  />
                </td>
              </tr>
            ) : (
              items.map((t) => (
                <tr key={t._id} className="hover:bg-[hsl(var(--muted))]/40">
                  <td className="p-3 font-medium">{t.name}</td>
                  <td className="p-3 text-[hsl(var(--muted-foreground))]">
                    {t.position}
                  </td>
                  <td className="p-3">
                    {t.isPublished ? (
                      <Badge>Published</Badge>
                    ) : (
                      <Badge variant="outline">
                        <EyeOff className="mr-1 h-3 w-3" /> Hidden
                      </Badge>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/admin/tech/${t._id}`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPendingDelete(t)}
                        aria-label="Delete"
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
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ''}"?`}
        description="This removes the tech entry from the public Tech Stack tab."
        confirmLabel="Delete tech item"
        destructive
        onConfirm={onDelete}
      />
    </div>
  );
}
