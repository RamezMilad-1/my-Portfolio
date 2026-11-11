import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** Pulsing placeholder that keeps the layout's shape while data loads. */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div aria-hidden className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />
  );
}
