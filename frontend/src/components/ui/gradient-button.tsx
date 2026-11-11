'use client';

import { Slot } from '@radix-ui/react-slot';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

interface GradientButtonProps extends ComponentProps<'button'> {
  /** Render the single child element (e.g. a link) with these styles instead of a `<button>`. */
  asChild?: boolean;
  variant?: 'primary' | 'outline';
  size?: 'md' | 'lg';
}

/**
 * The site's gradient call-to-action. All glow and sheen layers live in CSS
 * (`.gradient-button-*` in globals.css), so `asChild` renders exactly one element.
 */
export function GradientButton({
  asChild,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: GradientButtonProps) {
  const Component = asChild ? Slot : 'button';
  return (
    <Component
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold tracking-[0.01em] transition-[transform,box-shadow,background-color,background-position] duration-300 ease-[var(--ease-premium)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:transition-transform [&_svg]:duration-300 [&_svg]:ease-[var(--ease-premium)] hover:[&_svg]:translate-x-0.5',
        size === 'lg' ? 'h-12 px-7 text-sm' : 'h-10 px-5 text-sm',
        variant === 'primary'
          ? 'gradient-button-primary text-white'
          : 'gradient-button-outline border-gradient text-foreground',
        className,
      )}
      {...props}
    />
  );
}
