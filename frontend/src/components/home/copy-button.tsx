'use client';

import { useEffect, useState } from 'react';

/** Copies `value` to the clipboard and confirms inline. */
export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    if (state === 'idle') return;
    const timer = window.setTimeout(() => setState('idle'), 2000);
    return () => window.clearTimeout(timer);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      setState('failed');
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className="relative rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-[hsl(220_25%_92%)] transition-[transform,color,border-color,background-color] duration-200 ease-[var(--ease-premium)] hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10 hover:text-white active:scale-[0.97]"
    >
      {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : label}
    </button>
  );
}
