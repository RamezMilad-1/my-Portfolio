'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTechById } from '@/lib/api/tech';
import { TechForm } from '@/components/admin/tech-form';

export default function EditTechItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useTechById(id);

  return (
    <div>
      <Link
        href="/admin/tech"
        className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Tech stack
      </Link>
      <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight">
        {isLoading ? 'Loading…' : data?.name ?? 'Edit tech item'}
      </h1>
      <div className="mt-8">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : data ? (
          <TechForm item={data} />
        ) : null}
      </div>
    </div>
  );
}
