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
  useCreateCertificate,
  useUpdateCertificate,
} from '@/lib/api/certificates';
import { useUploadMedia } from '@/lib/api/media';
import { uploadsUrl } from '@/lib/utils';
import type { Certificate } from '@/lib/types';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  issuer: z.string().optional(),
  issuedAt: z.string().optional(),
  credentialUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  position: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});
type Form = z.infer<typeof schema>;

interface Props {
  certificate?: Certificate;
}

export function CertificateForm({ certificate }: Props) {
  const router = useRouter();
  const create = useCreateCertificate();
  const update = useUpdateCertificate();
  const upload = useUploadMedia();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: certificate?.title ?? '',
      issuer: certificate?.issuer ?? '',
      issuedAt: certificate?.issuedAt ?? '',
      credentialUrl: certificate?.credentialUrl ?? '',
      imageUrl: certificate?.imageUrl ?? '',
      description: certificate?.description ?? '',
      position: certificate?.position ?? 0,
      isPublished: certificate?.isPublished ?? true,
    },
  });

  const imageUrl = watch('imageUrl');
  const isPublished = watch('isPublished');

  const onSubmit = async (values: Form) => {
    try {
      if (certificate) {
        await update.mutateAsync({ id: certificate._id, payload: values });
        toast.success('Certificate updated');
      } else {
        await create.mutateAsync(values);
        toast.success('Certificate created');
      }
      router.push('/admin/certificates');
    } catch (err: unknown) {
      let msg = 'Could not save';
      if (err && typeof err === 'object' && 'response' in err) {
        const r = (err as { response?: { data?: { message?: string | string[] } } }).response;
        const m = r?.data?.message;
        if (Array.isArray(m)) msg = m.join(', ');
        else if (typeof m === 'string') msg = m;
      }
      toast.error(msg);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const m = await upload.mutateAsync({ file });
      setValue('imageUrl', m.url, { shouldDirty: true });
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register('title')} />
          {errors.title ? (
            <p className="text-xs text-red-500">{errors.title.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="issuer">Issuer</Label>
          <Input
            id="issuer"
            placeholder="Coursera, AWS, freeCodeCamp…"
            {...register('issuer')}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="issuedAt">Issued on</Label>
          <Input
            id="issuedAt"
            placeholder="2024 · March, or YYYY-MM"
            {...register('issuedAt')}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="credentialUrl">Credential URL</Label>
          <Input
            id="credentialUrl"
            placeholder="https://verify.example.com/..."
            {...register('credentialUrl')}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Image</Label>
        <div className="flex items-center gap-3">
          <Input
            {...register('imageUrl')}
            placeholder="/uploads/images/..."
          />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[hsl(var(--border))] px-3 py-2 text-xs hover:bg-[hsl(var(--muted))]">
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) await handleUpload(f);
                e.target.value = '';
              }}
            />
          </label>
        </div>
        {imageUrl ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-[hsl(var(--border))]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uploadsUrl(imageUrl)}
              alt=""
              className="max-h-72 w-full object-contain"
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="What did this cover? Anything relevant a recruiter would want to know."
          {...register('description')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            type="number"
            {...register('position', { valueAsNumber: true })}
          />
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
          onClick={() => router.push('/admin/certificates')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {certificate ? 'Save changes' : 'Create certificate'}
        </Button>
      </div>
    </form>
  );
}
