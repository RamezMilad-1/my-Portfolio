import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Friendly empty-state card used inside admin lists. Shows an icon, a short
 * heading, helper text, and an optional action slot (usually a single Button).
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-12 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
        <Icon className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
      </div>
      <p className="mt-4 font-medium text-[hsl(var(--foreground))]">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
