import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { GradientButton } from '@/components/ui/gradient-button';

export default function ProjectNotFound() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-32 pb-20 text-center sm:px-6">
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Project not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This project doesn&apos;t exist, or it&apos;s no longer published.
      </p>
      <GradientButton asChild variant="outline" className="mt-6">
        <Link href="/#portfolio">
          <ArrowLeft className="h-4 w-4" /> Back to portfolio
        </Link>
      </GradientButton>
    </div>
  );
}
