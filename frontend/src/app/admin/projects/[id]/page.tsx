'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useProjectById } from '@/lib/api/projects';
import { ProjectForm } from '@/components/admin/project-form';

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useProjectById(id);

  return (
    <div>
      <Link
        href="/admin/projects"
        className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Projects
      </Link>
      <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight">
        {isLoading ? 'Loading…' : data?.name ?? 'Edit project'}
      </h1>
      <div className="mt-8">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading project…
          </div>
        ) : data ? (
          <ProjectForm project={data} />
        ) : null}
      </div>
    </div>
  );
}
