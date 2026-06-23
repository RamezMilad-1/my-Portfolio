import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TechForm } from '@/components/admin/tech-form';

export default function NewTechItemPage() {
  return (
    <div>
      <Link
        href="/admin/tech"
        className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Tech stack
      </Link>
      <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight">
        New tech item
      </h1>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        Add a tech entry. It appears in the public Portfolio → Tech Stack tab
        as soon as it&apos;s published.
      </p>
      <div className="mt-8">
        <TechForm />
      </div>
    </div>
  );
}
