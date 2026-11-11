'use client';

import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { Input, Textarea } from '@/components/ui/input';
import { certificatesCollection } from '@/lib/admin/queries';
import { ACCEPT } from '@/lib/admin/upload';
import { errorMessage } from '@/lib/api/client';
import { cloudinaryImage } from '@/lib/cloudinary';
import type { Certificate, CertificateInput } from '@/lib/types';
import { Field } from '../field';
import { FormActions } from '../form-actions';
import { UploadButton } from '../upload-button';
import { formValues, positionRules, required, urlRules } from './form-utils';

const LIST = '/admin/certificates';

const EMPTY: CertificateInput = {
  title: '',
  issuer: '',
  issuedAt: '',
  credentialUrl: '',
  imageUrl: '',
  description: '',
  position: 0,
  isPublished: true,
};

export function CertificateForm({ certificate }: { certificate?: Certificate }) {
  const router = useRouter();
  const save = certificatesCollection.useSave();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CertificateInput>({ defaultValues: formValues(EMPTY, certificate) });
  const imageUrl = useWatch({ control, name: 'imageUrl' });

  const onSubmit = handleSubmit(async (input) => {
    try {
      await save.mutateAsync({ id: certificate?._id, input });
      toast.success(certificate ? 'Certificate updated' : 'Certificate created');
      router.push(LIST);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save'));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="Title"
          htmlFor="title"
          error={errors.title?.message}
          className="md:col-span-2"
        >
          <Input
            id="title"
            maxLength={160}
            aria-invalid={errors.title ? true : undefined}
            {...register('title', required('Title'))}
          />
        </Field>
        <Field label="Issuer" htmlFor="issuer">
          <Input
            id="issuer"
            maxLength={120}
            placeholder="Coursera, AWS, freeCodeCamp…"
            {...register('issuer')}
          />
        </Field>
        <Field label="Issued" htmlFor="issuedAt" hint="Free text, e.g. “August 2025”.">
          <Input id="issuedAt" maxLength={60} {...register('issuedAt')} />
        </Field>
        <Field
          label="Credential URL"
          htmlFor="credentialUrl"
          error={errors.credentialUrl?.message}
          className="md:col-span-2"
        >
          <Input
            id="credentialUrl"
            type="url"
            placeholder="https://verify.example.com/…"
            aria-invalid={errors.credentialUrl ? true : undefined}
            {...register('credentialUrl', urlRules)}
          />
        </Field>
      </div>

      <Field label="Image" htmlFor="imageUrl" error={errors.imageUrl?.message}>
        <div className="flex items-center gap-3">
          <Input
            id="imageUrl"
            type="url"
            placeholder="https://…"
            aria-invalid={errors.imageUrl ? true : undefined}
            {...register('imageUrl', urlRules)}
          />
          <UploadButton
            accept={ACCEPT.images}
            onUploaded={(media) => setValue('imageUrl', media.url, { shouldDirty: true })}
          />
        </div>
        {imageUrl ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cloudinaryImage(imageUrl, 900)}
              alt=""
              className="max-h-72 w-full object-contain"
            />
          </div>
        ) : null}
      </Field>

      <Field label="Description" htmlFor="description" hint="Optional — what it covered.">
        <Textarea id="description" rows={4} maxLength={2000} {...register('description')} />
      </Field>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        submitLabel={certificate ? 'Save changes' : 'Create certificate'}
      />
    </form>
  );
}
