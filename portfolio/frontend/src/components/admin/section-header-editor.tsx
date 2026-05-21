'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { useProfile, useUpdateProfile } from '@/lib/api/profile';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Profile } from '@/lib/types';

/** The only Profile fields this editor is allowed to touch. */
export type SectionHeaderField =
  | 'aboutKicker'
  | 'aboutTitle'
  | 'aboutSubtitle'
  | 'portfolioKicker'
  | 'portfolioTitle'
  | 'portfolioSubtitle'
  | 'contactKicker'
  | 'contactTitle'
  | 'contactSubtitle'
  | 'lifelineKicker'
  | 'lifelineTitle'
  | 'lifelineSubtitle';

interface Props {
  /** Card title, e.g. "About section header" */
  label: string;
  /** Helper text shown below the card title */
  description?: string;
  /** Which 3 Profile fields hold the kicker / title / subtitle for this section */
  fields: {
    kicker: SectionHeaderField;
    title: SectionHeaderField;
    subtitle: SectionHeaderField;
  };
  /** Placeholders shown in the inputs — these are the public defaults */
  defaults: {
    kicker: string;
    title: string;
    subtitle: string;
  };
}

/**
 * Inline editor card used on admin pages to edit the kicker, title, and
 * subtitle for a public homepage section. Persists into the Profile
 * singleton. Blank fields fall back to the public default at render time.
 */
export function SectionHeaderEditor({
  label,
  description,
  fields,
  defaults,
}: Props) {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();

  const [kicker, setKicker] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');

  // Profile fields are heterogeneous (strings, arrays, objects); we only ever
  // read the SectionHeaderField keys here, which are all strings, so a loose
  // string-indexed view is safe.
  const profileStr = profile
    ? (profile as unknown as Record<string, string | undefined>)
    : null;

  useEffect(() => {
    if (profileStr) {
      setKicker(profileStr[fields.kicker] ?? '');
      setTitle(profileStr[fields.title] ?? '');
      setSubtitle(profileStr[fields.subtitle] ?? '');
    }
  }, [profileStr, fields.kicker, fields.title, fields.subtitle]);

  const dirty =
    profileStr != null &&
    (kicker !== (profileStr[fields.kicker] ?? '') ||
      title !== (profileStr[fields.title] ?? '') ||
      subtitle !== (profileStr[fields.subtitle] ?? ''));

  const save = async () => {
    try {
      await update.mutateAsync({
        [fields.kicker]: kicker,
        [fields.title]: title,
        [fields.subtitle]: subtitle,
      } as Partial<Profile>);
      toast.success(`${label} updated`);
    } catch {
      toast.error('Could not save');
    }
  };

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
            {label}
          </h2>
          {description ? (
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              {description}
            </p>
          ) : null}
        </div>
        <Button
          onClick={save}
          disabled={!dirty || update.isPending}
          size="sm"
          type="button"
        >
          {update.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save header
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${fields.kicker}-input`}>Kicker</Label>
          <Input
            id={`${fields.kicker}-input`}
            value={kicker}
            onChange={(e) => setKicker(e.target.value)}
            placeholder={defaults.kicker}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${fields.title}-input`}>Title</Label>
          <Input
            id={`${fields.title}-input`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={defaults.title}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor={`${fields.subtitle}-input`}>Subtitle</Label>
          <Textarea
            id={`${fields.subtitle}-input`}
            rows={2}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder={defaults.subtitle}
          />
        </div>
      </div>
    </div>
  );
}
