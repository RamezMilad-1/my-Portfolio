import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Renders a "← label" link above the title. */
  back?: { href: string; label: string };
  action?: ReactNode;
}

export function PageHeader({ title, description, back, action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {back ? (
          <Link
            href={back.href}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {back.label}
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">Admin</p>
        )}
        <h1 className={`font-display text-3xl font-semibold tracking-tight ${back ? 'mt-4' : ''}`}>
          {title}
        </h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
