import { cn } from '@/lib/utils';

/**
 * Subtle pulsing skeleton block. Use to mask content shape while data loads,
 * instead of "Loading..." text — feels much more polished.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-pulse rounded-md bg-[hsl(var(--muted))]',
        className,
      )}
      {...props}
    />
  );
}
