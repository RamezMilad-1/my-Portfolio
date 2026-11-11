'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, m } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { DURATION, EASE_PREMIUM } from '@/components/motion/tokens';
import { cn } from '@/lib/utils';

interface LightboxProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name of the dialog. */
  title: string;
  /** Arrow-key handlers; omit when there's only one item. */
  onPrevious?: () => void;
  onNext?: () => void;
  className?: string;
  children: ReactNode;
}

/**
 * Full-screen viewer built on Radix Dialog (focus trap, Escape to close, scroll lock,
 * aria-modal). Clicking the dimmed background closes it; arrow keys step through items.
 */
export function Lightbox({
  open,
  onClose,
  title,
  onPrevious,
  onNext,
  className,
  children,
}: LightboxProps) {
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft' && onPrevious) onPrevious();
    if (event.key === 'ArrowRight' && onNext) onNext();
  };
  const onBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.fast, ease: EASE_PREMIUM }}
                className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md"
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content
              asChild
              forceMount
              aria-describedby={undefined}
              onKeyDown={onKeyDown}
            >
              <m.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: EASE_PREMIUM }}
                onClick={onBackdropClick}
                className={cn(
                  'fixed inset-0 z-[100] flex items-center justify-center p-4 focus:outline-none sm:p-8',
                  className,
                )}
              >
                <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
                {children}
              </m.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

const controlClasses =
  'flex items-center justify-center rounded-full text-white backdrop-blur-md transition-[transform,background-color] duration-200 ease-[var(--ease-premium)] hover:scale-105';

export function LightboxClose({ className }: { className?: string }) {
  return (
    <DialogPrimitive.Close
      aria-label="Close"
      className={cn(controlClasses, 'absolute right-4 top-4 z-10 h-10 w-10', className)}
    >
      <X className="h-5 w-5" />
    </DialogPrimitive.Close>
  );
}

export function LightboxArrow({
  direction,
  onClick,
  className,
}: {
  direction: 'previous' | 'next';
  onClick: () => void;
  className?: string;
}) {
  const Icon = direction === 'previous' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={direction === 'previous' ? 'Previous' : 'Next'}
      onClick={onClick}
      className={cn(
        controlClasses,
        'absolute top-1/2 z-10 h-11 w-11 -translate-y-1/2',
        direction === 'previous' ? 'left-3 sm:left-6' : 'right-3 sm:right-6',
        className,
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
