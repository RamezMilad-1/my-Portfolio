import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TimelineForm } from '@/components/admin/timeline-form';

export default function NewTimelineEntryPage() {
  return (
    <div>
      <Link
        href="/admin/timeline"
        className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Lifeline
      </Link>
      <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight">
        New entry
      </h1>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        Add a milestone to the public Lifeline. It appears as soon as it&apos;s
        published.
      </p>
      <div className="mt-8">
        <TimelineForm />
      </div>
    </div>
  );
}
