'use client';

import { Children, type ReactNode, useState } from 'react';
import { GradientButton } from '@/components/ui/gradient-button';

interface ShowMoreProps {
  /** How many items are visible before "View all". */
  initial: number;
  className?: string;
  /** Label for the expand button, e.g. "View all 8 projects". */
  moreLabel: string;
  children: ReactNode;
}

/** Shows the first `initial` server-rendered items, with a toggle for the rest. */
export function ShowMore({ initial, className, moreLabel, children }: ShowMoreProps) {
  const [expanded, setExpanded] = useState(false);
  const items = Children.toArray(children);

  return (
    <>
      <div className={className}>{expanded ? items : items.slice(0, initial)}</div>
      {items.length > initial ? (
        <div className="mt-8 flex justify-center">
          <GradientButton
            variant="outline"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'Show less' : moreLabel}
          </GradientButton>
        </div>
      ) : null}
    </>
  );
}
