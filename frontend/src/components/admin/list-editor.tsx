'use client';

import { Plus, Trash2, X } from 'lucide-react';
import { type KeyboardEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ListEditorProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  /** `chips` for short tags (deduplicated), `rows` for sentences. */
  variant?: 'chips' | 'rows';
  id?: string;
}

/** Add/remove editor for a list of strings. Enter adds the typed item. */
export function ListEditor({
  value,
  onChange,
  placeholder,
  variant = 'rows',
  id,
}: ListEditorProps) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const item = draft.trim();
    if (!item) return;
    if (variant === 'rows' || !value.includes(item)) onChange([...value, item]);
    setDraft('');
  };
  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    add();
  };

  return (
    <div className="space-y-2">
      {value.length > 0 ? (
        variant === 'chips' ? (
          <ul className="flex flex-wrap gap-1.5">
            {value.map((item, index) => (
              <li
                key={item}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs"
              >
                {item}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Remove ${item}`}
                  className="rounded-full hover:bg-black/10"
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-2">
            {value.map((item, index) => (
              <li key={`${item}-${index}`} className="flex items-center gap-2">
                <span className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm">
                  {item}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  aria-label={`Remove “${item}”`}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </li>
            ))}
          </ul>
        )
      ) : null}
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
        />
        <Button type="button" variant="outline" onClick={add} aria-label="Add">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
