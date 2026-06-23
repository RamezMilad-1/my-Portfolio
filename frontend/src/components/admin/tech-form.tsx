'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  useCreateTechItem,
  useUpdateTechItem,
} from '@/lib/api/tech';
import type { TechItem } from '@/lib/types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().optional(),
  position: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});
type Form = z.infer<typeof schema>;

interface Props {
  item?: TechItem;
}

export function TechForm({ item }: Props) {
  const router = useRouter();
  const create = useCreateTechItem();
  const update = useUpdateTechItem();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: item?.name ?? '',
      category: item?.category ?? '',
      position: item?.position ?? 0,
      isPublished: item?.isPublished ?? true,
    },
  });

  const isPublished = watch('isPublished');

  const onSubmit = async (values: Form) => {
    try {
      if (item) {
        await update.mutateAsync({ id: item._id, payload: values });
        toast.success('Tech item updated');
      } else {
        await create.mutateAsync(values);
        toast.success('Tech item created');
      }
      router.push('/admin/tech');
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
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="React, TypeScript, NestJS, Postgres…"
            {...register('name')}
          />
          {errors.name ? (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          ) : null}
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Use the brand name. The public Tech Stack grid auto-picks a logo
            (Devicon / Simple Icons) from this name.
          </p>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            placeholder="Languages · Frameworks · Databases · Tools"
            {...register('category')}
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
          onClick={() => router.push('/admin/tech')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {item ? 'Save changes' : 'Create tech item'}
        </Button>
      </div>
    </form>
  );
}
