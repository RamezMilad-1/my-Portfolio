'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  holdMs?: number;
  /**
   * Bump this to restart the animation from scratch. Used by Hero to replay
   * the typewriter when the hero re-enters the viewport.
   */
  runId?: number;
  /**
   * When false (default), the typewriter types through each phrase in order
   * once, then settles on the last phrase with the cursor still blinking —
   * no continuous delete/retype loop.
   * When true, falls back to the original delete-and-cycle behavior.
   */
  loop?: boolean;
  className?: string;
}

export function Typewriter({
  phrases,
  typingSpeed = 75,
  deletingSpeed = 40,
  holdMs = 1400,
  runId = 0,
  loop = false,
  className,
}: Props) {
  const [text, setText] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [finished, setFinished] = useState(false);
  const lastRunId = useRef(runId);

  // Reset state when the parent asks for a fresh run.
  useEffect(() => {
    if (lastRunId.current === runId) return;
    lastRunId.current = runId;
    setText('');
    setPhraseIdx(0);
    setDeleting(false);
    setFinished(false);
  }, [runId]);

  useEffect(() => {
    if (phrases.length === 0 || finished) return;

    const current = phrases[phraseIdx % phrases.length];
    const isLastPhrase = phraseIdx >= phrases.length - 1;
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && text === current) {
      // Fully typed.
      if (!loop && isLastPhrase) {
        setFinished(true);
        return;
      }
      timeout = setTimeout(() => setDeleting(true), holdMs);
    } else if (deleting && text === '') {
      setDeleting(false);
      setPhraseIdx((i) => (i + 1) % phrases.length);
    } else {
      timeout = setTimeout(
        () => {
          setText((t) =>
            deleting ? current.slice(0, t.length - 1) : current.slice(0, t.length + 1),
          );
        },
        deleting ? deletingSpeed : typingSpeed,
      );
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, phraseIdx, phrases, typingSpeed, deletingSpeed, holdMs, loop, finished]);

  return (
    <span className={className}>
      {text}
      <span
        aria-hidden
        className="ml-0.5 inline-block h-[0.9em] w-[2px] -translate-y-[2px] animate-blink bg-current align-middle"
      />
    </span>
  );
}
