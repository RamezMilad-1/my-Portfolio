import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProjectForm } from '@/components/admin/project-form';

export default function NewProjectPage() {
  return (
    <div>
      <Link
        href="/admin/projects"
        className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Projects
      </Link>
      <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight">New project</h1>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        Create a new project entry. You can leave fields empty and fill them in later.
      </p>
      <div className="mt-8">
        <ProjectForm />
      </div>
    </div>
  );
}
