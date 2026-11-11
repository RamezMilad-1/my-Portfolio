'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { techCollection } from '@/lib/admin/queries';
import { errorMessage } from '@/lib/api/client';
import type { TechItem, TechItemInput } from '@/lib/types';
import { Field } from '../field';
import { FormActions } from '../form-actions';
import { formValues, positionRules, required } from './form-utils';

const LIST = '/admin/tech';

const EMPTY: TechItemInput = { name: '', category: '', position: 0, isPublished: true };

export function TechForm({ item }: { item?: TechItem }) {
  const router = useRouter();
  const save = techCollection.useSave();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TechItemInput>({ defaultValues: formValues(EMPTY, item) });

  const onSubmit = handleSubmit(async (input) => {
    try {
      await save.mutateAsync({ id: item?._id, input });
      toast.success(item ? 'Tech item updated' : 'Tech item created');
      router.push(LIST);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save'));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="Name"
          htmlFor="name"
          hint="Use the brand name — the logo is picked from it."
          error={errors.name?.message}
          className="md:col-span-2"
        >
          <Input
            id="name"
            maxLength={60}
            placeholder="React, TypeScript, NestJS…"
            aria-invalid={errors.name ? true : undefined}
            {...register('name', required('Name'))}
          />
        </Field>
        <Field
          label="Category"
          htmlFor="category"
          hint="Items are grouped under it."
          className="md:col-span-2"
        >
          <Input
            id="category"
            maxLength={60}
            placeholder="Languages · Frontend · Backend · Tools"
            {...register('category')}
          />
        </Field>
        <Field
          label="Position"
          htmlFor="position"
          hint="Lower numbers appear first."
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
        submitLabel={item ? 'Save changes' : 'Create tech item'}
      />
    </form>
  );
}
