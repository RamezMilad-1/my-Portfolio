'use client';

import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'outline';
  size?: 'md' | 'lg';
}

/**
 * Gradient button styled to match the EkiZR aesthetic.
 *
 * When `asChild` is used (e.g. to wrap Next.js <Link>), Radix Slot clones the
 * single child element — so all gradient + glow layers live in CSS (see the
 * `.gb-primary` / `.gb-outline` utilities in globals.css) rather than as
 * sibling DOM nodes. That keeps the rendered output to exactly one element.
 */
export const GradientButton = forwardRef<HTMLButtonElement, Props>(
  function GradientButton(
    {
      asChild,
      variant = 'primary',
      size = 'md',
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const Comp = asChild ? Slot : 'button';
    const sizes =
      size === 'lg' ? 'h-12 px-7 text-sm' : 'h-10 px-5 text-sm';

    const base =
      'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold tracking-[0.01em] transition-[transform,box-shadow,background-color,background-position] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--brand-violet))] focus-visible:ring-offset-[hsl(var(--background))] [&_svg]:transition-transform [&_svg]:duration-300 [&_svg]:ease-[cubic-bezier(0.22,1,0.36,1)] hover:[&_svg]:translate-x-0.5 [&>span]:relative [&>span]:z-[1]';

    const variantClasses =
      variant === 'primary'
        ? 'gb-primary text-white'
        : 'gb-outline ek-border-gradient text-[hsl(var(--foreground))]';

    return (
      <Comp
        ref={ref}
        className={cn(base, sizes, variantClasses, className)}
        {...rest}
      >
        {children}
      </Comp>
    );
  },
);
