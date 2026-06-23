import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]',
        secondary:
          'border-transparent bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]',
        outline: 'border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
      },
    },
    defaultVariants: { variant: 'outline' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
