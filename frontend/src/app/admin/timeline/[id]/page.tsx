'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTimelineById } from '@/lib/api/timeline';
import { TimelineForm } from '@/components/admin/timeline-form';

export default function EditTimelineEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useTimelineById(id);

  return (
    <div>
      <Link
        href="/admin/timeline"
        className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Lifeline
      </Link>
      <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight">
        {isLoading ? 'Loading…' : data?.year ?? 'Edit entry'}
      </h1>
      <div className="mt-8">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : data ? (
          <TimelineForm entry={data} />
        ) : null}
      </div>
    </div>
  );
}
