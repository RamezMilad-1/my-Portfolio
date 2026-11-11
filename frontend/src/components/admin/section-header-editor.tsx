'use client';

import { Loader2, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { useProfile, useUpdateProfile } from '@/lib/admin/queries';
import { errorMessage } from '@/lib/api/client';
import type { Profile } from '@/lib/types';
import { Field } from './field';

type Section = 'about' | 'portfolio' | 'lifeline' | 'contact';

const LABELS: Record<Section, string> = {
  about: 'About section heading',
  portfolio: 'Portfolio section heading',
  lifeline: 'Experience section heading',
  contact: 'Contact section heading',
};

interface HeaderFields {
  kicker: string;
  title: string;
  subtitle: string;
}

const fieldsOf = (section: Section) =>
  ({
    kicker: `${section}Kicker`,
    title: `${section}Title`,
    subtitle: `${section}Subtitle`,
  }) as const satisfies Record<keyof HeaderFields, keyof Profile>;

function HeaderForm({ section, profile }: { section: Section; profile: Profile }) {
  const keys = fieldsOf(section);
  const update = useUpdateProfile();
  const form = useForm<HeaderFields>({
    defaultValues: {
      kicker: profile[keys.kicker],
      title: profile[keys.title],
      subtitle: profile[keys.subtitle],
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await update.mutateAsync({
        [keys.kicker]: values.kicker,
        [keys.title]: values.title,
        [keys.subtitle]: values.subtitle,
      });
      form.reset(values);
      toast.success(`${LABELS[section]} saved`);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save'));
    }
  });

  const id = (name: keyof HeaderFields) => `${section}-${name}`;
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {LABELS[section]}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Shown above the section on the public site. Leave all three empty to show no heading.
          </p>
        </div>
        <Button type="submit" size="sm" disabled={!form.formState.isDirty || update.isPending}>
          {update.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save heading
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Kicker" htmlFor={id('kicker')}>
          <Input id={id('kicker')} maxLength={80} {...form.register('kicker')} />
        </Field>
        <Field label="Title" htmlFor={id('title')}>
          <Input id={id('title')} maxLength={160} {...form.register('title')} />
        </Field>
        <Field label="Subtitle" htmlFor={id('subtitle')} className="md:col-span-2">
          <Textarea id={id('subtitle')} rows={2} maxLength={400} {...form.register('subtitle')} />
        </Field>
      </div>
    </form>
  );
}

/** Edits one public section's kicker, title and subtitle (stored on the profile). */
export function SectionHeaderEditor({ section }: { section: Section }) {
  const { data: profile } = useProfile();
  if (!profile)
    return <div className="h-44 animate-pulse rounded-2xl border border-border bg-card" />;
  return <HeaderForm section={section} profile={profile} />;
}
