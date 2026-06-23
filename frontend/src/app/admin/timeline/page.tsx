'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  GitBranch,
  EyeOff,
} from 'lucide-react';
import {
  useTimelineAll,
  useDeleteTimelineEntry,
} from '@/lib/api/timeline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SectionHeaderEditor } from '@/components/admin/section-header-editor';
import type { TimelineEntry } from '@/lib/types';

export default function AdminTimelinePage() {
  const { data, isLoading } = useTimelineAll();
  const del = useDeleteTimelineEntry();
  const [pendingDelete, setPendingDelete] = useState<TimelineEntry | null>(
    null,
  );

  const onDelete = async () => {
    if (!pendingDelete) return;
    try {
      await del.mutateAsync(pendingDelete._id);
      toast.success('Entry deleted');
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
            Lifeline
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Manage the vertical timeline that shows under the Contact section.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/timeline/new">
            <Plus className="h-4 w-4" /> New entry
          </Link>
        </Button>
      </div>

      <div className="mt-8">
        <SectionHeaderEditor
          label="Lifeline section header"
          description="The kicker, title, and subtitle shown above the Lifeline on the public site. Leave blank to use the defaults."
          fields={{
            kicker: 'lifelineKicker',
            title: 'lifelineTitle',
            subtitle: 'lifelineSubtitle',
          }}
          defaults={{
            kicker: 'Lifeline',
            title: 'The road so far',
            subtitle:
              'A short timeline of milestones — the moments that shaped the work behind everything above.',
          }}
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[hsl(var(--border))]">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--muted))]/50 text-left">
            <tr>
              <th className="p-3">Year</th>
              <th className="p-3">Topic</th>
              <th className="p-3">Body</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td className="p-3">
                    <Skeleton className="h-5 w-16" />
                  </td>
                  <td className="p-3">
                    <Skeleton className="h-5 w-32" />
                  </td>
                  <td className="p-3">
                    <Skeleton className="h-5 w-60" />
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
                <td colSpan={5} className="p-0">
                  <EmptyState
                    className="m-4 border-0 border-dashed-0"
                    icon={GitBranch}
                    title="No timeline entries yet"
                    description="Add milestones from your journey. Each appears as a bullet on the public Lifeline section."
                    action={
                      <Button asChild>
                        <Link href="/admin/timeline/new">
                          <Plus className="h-4 w-4" /> New entry
                        </Link>
                      </Button>
                    }
                  />
                </td>
              </tr>
            ) : (
              items.map((e) => (
                <tr key={e._id} className="hover:bg-[hsl(var(--muted))]/40">
                  <td className="p-3 font-medium">{e.year}</td>
                  <td className="p-3 text-[hsl(var(--muted-foreground))]">
                    {e.topic || '—'}
                  </td>
                  <td className="max-w-md truncate p-3 text-[hsl(var(--muted-foreground))]">
                    {e.body}
                  </td>
                  <td className="p-3">
                    {e.isPublished ? (
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
                        <Link href={`/admin/timeline/${e._id}`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPendingDelete(e)}
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
        title={`Delete "${pendingDelete?.year ?? ''}"?`}
        description="This permanently removes the timeline entry."
        confirmLabel="Delete entry"
        destructive
        onConfirm={onDelete}
      />
    </div>
  );
}
