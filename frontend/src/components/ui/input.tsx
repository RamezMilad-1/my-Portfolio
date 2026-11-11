import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const fieldClasses =
  'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500/70';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(fieldClasses, 'h-10', className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(fieldClasses, 'min-h-[100px]', className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cn(fieldClasses, 'h-10 py-0', className)} {...props} />;
}
