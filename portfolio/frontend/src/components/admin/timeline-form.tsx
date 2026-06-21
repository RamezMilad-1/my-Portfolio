'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  useCreateTimelineEntry,
  useUpdateTimelineEntry,
} from '@/lib/api/timeline';
import type { TimelineEntry } from '@/lib/types';

const schema = z.object({
  year: z.string().min(1, 'Year is required'),
  topic: z.string().optional(),
  body: z.string().min(1, 'Body is required'),
  type: z.string().optional(),
  organization: z.string().optional(),
  position: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});
type Form = z.infer<typeof schema>;

interface Props {
  entry?: TimelineEntry;
}

export function TimelineForm({ entry }: Props) {
  const router = useRouter();
  const create = useCreateTimelineEntry();
  const update = useUpdateTimelineEntry();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      year: entry?.year ?? '',
      topic: entry?.topic ?? '',
      body: entry?.body ?? '',
      type: entry?.type ?? 'education',
      organization: entry?.organization ?? '',
      position: entry?.position ?? 0,
      isPublished: entry?.isPublished ?? true,
    },
  });

  const isPublished = watch('isPublished');

  const onSubmit = async (values: Form) => {
    try {
      if (entry) {
        await update.mutateAsync({ id: entry._id, payload: values });
        toast.success('Timeline entry updated');
      } else {
        await create.mutateAsync(values);
        toast.success('Timeline entry created');
      }
      router.push('/admin/timeline');
    } catch (err: unknown) {
      let msg = 'Could not save';
      if (err && typeof err === 'object' && 'response' in err) {
        const r = (err as { response?: { data?: { message?: string | string[] } } })
          .response;
        const m = r?.data?.message;
        if (Array.isArray(m)) msg = m.join(', ');
        else if (typeof m === 'string') msg = m;
      }
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            placeholder="2024, or Summer 2024"
            {...register('year')}
          />
          {errors.year ? (
            <p className="text-xs text-red-500">{errors.year.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="topic">Topic (optional)</Label>
          <Input
            id="topic"
            placeholder="First freelance gig, Started Uni, …"
            {...register('topic')}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="body">Body</Label>
        <Textarea
          id="body"
          rows={5}
          placeholder="What happened that year? Keep it short and human."
          {...register('body')}
        />
        {errors.body ? (
          <p className="text-xs text-red-500">{errors.body.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            {...register('type')}
            className="flex h-10 w-full rounded-md border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          >
            <option value="education">Education</option>
            <option value="work">Work</option>
            <option value="achievement">Achievement</option>
            <option value="personal">Personal</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="organization">Organization</Label>
          <Input
            id="organization"
            placeholder="GUC · Google · …"
            {...register('organization')}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            type="number"
            {...register('position', { valueAsNumber: true })}
          />
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Lower numbers appear first.
          </p>
        </div>
        <div className="flex items-end">
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) =>
                setValue('isPublished', e.target.checked, { shouldDirty: true })
              }
              className="h-4 w-4 rounded border-[hsl(var(--border))]"
            />
            Published
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/timeline')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {entry ? 'Save changes' : 'Create entry'}
        </Button>
      </div>
    </form>
  );
}
