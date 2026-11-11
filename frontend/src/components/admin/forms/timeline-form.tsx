'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Input, Select, Textarea } from '@/components/ui/input';
import { timelineCollection } from '@/lib/admin/queries';
import { errorMessage } from '@/lib/api/client';
import { TIMELINE_TYPES, type TimelineEntry, type TimelineEntryInput } from '@/lib/types';
import { Field } from '../field';
import { FormActions } from '../form-actions';
import { formValues, positionRules, required } from './form-utils';

const LIST = '/admin/timeline';

const EMPTY: TimelineEntryInput = {
  year: '',
  topic: '',
  body: '',
  type: 'education',
  organization: '',
  position: 0,
  isPublished: true,
};

const TYPE_LABELS: Record<(typeof TIMELINE_TYPES)[number], string> = {
  education: 'Education',
  work: 'Work',
  achievement: 'Achievement',
  personal: 'Personal',
};

export function TimelineForm({ entry }: { entry?: TimelineEntry }) {
  const router = useRouter();
  const save = timelineCollection.useSave();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TimelineEntryInput>({ defaultValues: formValues(EMPTY, entry) });

  const onSubmit = handleSubmit(async (input) => {
    try {
      await save.mutateAsync({ id: entry?._id, input });
      toast.success(entry ? 'Entry updated' : 'Entry created');
      router.push(LIST);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save'));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="When"
          htmlFor="year"
          hint="e.g. “2024” or “Summer 2024”."
          error={errors.year?.message}
        >
          <Input
            id="year"
            maxLength={40}
            aria-invalid={errors.year ? true : undefined}
            {...register('year', required('When'))}
          />
        </Field>
        <Field label="Topic" htmlFor="topic" hint="Optional headline for the entry.">
          <Input id="topic" maxLength={120} {...register('topic')} />
        </Field>
      </div>

      <Field label="Description" htmlFor="body" error={errors.body?.message}>
        <Textarea
          id="body"
          rows={5}
          maxLength={2000}
          placeholder="What happened? Keep it short and human."
          aria-invalid={errors.body ? true : undefined}
          {...register('body', required('Description'))}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Type" htmlFor="type">
          <Select id="type" {...register('type')}>
            {TIMELINE_TYPES.map((type) => (
              <option key={type} value={type}>
                {TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Organization" htmlFor="organization">
          <Input id="organization" maxLength={120} {...register('organization')} />
        </Field>
        <Field
          label="Position"
          htmlFor="position"
          hint="Order oldest to newest — the last entry is marked “Latest”."
          error={errors.position?.message}
        >
          <Input id="position" type="number" min={0} {...register('position', positionRules)} />
        </Field>
        <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium">
          <input type="checkbox" className="h-4 w-4" {...register('isPublished')} />
          Published
        </label>
      </div>

      <FormActions
        cancelHref={LIST}
        pending={save.isPending}
        submitLabel={entry ? 'Save changes' : 'Create entry'}
      />
    </form>
  );
}
