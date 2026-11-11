'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { useUpdateProfile } from '@/lib/admin/queries';
import { ACCEPT } from '@/lib/admin/upload';
import { errorMessage } from '@/lib/api/client';
import type { Profile, ProfileInput } from '@/lib/types';
import { Field, FormSection } from '../field';
import { FormActions } from '../form-actions';
import { ListEditor } from '../list-editor';
import { UploadButton } from '../upload-button';
import { emailRules, formValues, urlRules } from './form-utils';

/** Everything on the profile except the section headings (edited next to each section). */
type ProfileFormValues = Required<
  Omit<
    ProfileInput,
    | 'aboutKicker'
    | 'aboutTitle'
    | 'aboutSubtitle'
    | 'portfolioKicker'
    | 'portfolioTitle'
    | 'portfolioSubtitle'
    | 'lifelineKicker'
    | 'lifelineTitle'
    | 'lifelineSubtitle'
    | 'contactKicker'
    | 'contactTitle'
    | 'contactSubtitle'
    | 'socials'
  >
> & { socials: { github: string; linkedin: string; x: string; website: string } };

const EMPTY: ProfileFormValues = {
  displayName: '',
  logoInitial: '',
  headline: '',
  headlines: [],
  bio: '',
  education: '',
  availability: '',
  email: '',
  avatarUrl: '',
  resumeUrl: '',
  socials: { github: '', linkedin: '', x: '', website: '' },
  aboutTagline: '',
  aboutLede: '',
  aboutFactLocation: '',
  aboutFactStack: '',
  aboutFactAvailable: '',
  aboutDividerLabel: '',
  aboutCapabilities: [],
  aboutFocusBlocks: [],
  contactCTALabel: '',
  responseTime: '',
};

const toFormValues = (profile: Profile): ProfileFormValues => ({
  ...formValues(EMPTY, profile),
  socials: formValues(EMPTY.socials, profile.socials),
});

export function ProfileForm({ profile }: { profile: Profile }) {
  const update = useUpdateProfile();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({ defaultValues: toFormValues(profile) });
  const focusBlocks = useFieldArray({ control, name: 'aboutFocusBlocks' });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const saved = await update.mutateAsync(values);
      reset(toFormValues(saved));
      toast.success('Profile saved');
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save'));
    }
  });

  const text = (
    name: keyof ProfileFormValues,
    label: string,
    options: { hint?: string; placeholder?: string; maxLength?: number; className?: string } = {},
  ) => (
    <Field label={label} htmlFor={name} hint={options.hint} className={options.className}>
      <Input
        id={name}
        maxLength={options.maxLength ?? 160}
        placeholder={options.placeholder}
        {...register(name)}
      />
    </Field>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <FormSection title="Identity">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {text('displayName', 'Display name', { maxLength: 80 })}
          {text('logoInitial', 'Logo initial', {
            hint: 'Shown in the header badge and favicon.',
            maxLength: 3,
          })}
          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              aria-invalid={errors.email ? true : undefined}
              {...register('email', emailRules)}
            />
          </Field>
          {text('availability', 'Availability', {
            placeholder: 'Open to internships',
            maxLength: 120,
          })}
          {text('education', 'Education', {
            placeholder: 'B.Sc. Computer Science · …',
            maxLength: 200,
          })}
        </div>
      </FormSection>

      <FormSection title="Hero">
        <Field
          label="Role headline"
          htmlFor="headlines"
          hint="The first phrase is the big headline at the top of the site."
        >
          <Controller
            control={control}
            name="headlines"
            render={({ field }) => (
              <ListEditor
                id="headlines"
                value={field.value}
                onChange={field.onChange}
                placeholder="Full-Stack Developer"
              />
            )}
          />
        </Field>
        {text('headline', 'Subtitle', { hint: 'One line under the headline.', maxLength: 300 })}
      </FormSection>

      <FormSection
        title="About"
        description="Each piece only appears on the site when it has content."
      >
        {text('aboutTagline', 'Tagline next to your name', {
          placeholder: '— Full-stack TypeScript developer',
        })}
        <Field label="Lede" htmlFor="aboutLede" hint="The large opening sentence.">
          <Textarea id="aboutLede" rows={3} maxLength={600} {...register('aboutLede')} />
        </Field>
        <Field label="Body" htmlFor="bio" hint="Separate paragraphs with a blank line.">
          <Textarea id="bio" rows={7} maxLength={8000} {...register('bio')} />
        </Field>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {text('aboutFactLocation', 'Location', { placeholder: 'Cairo, Egypt · GMT+2' })}
          {text('aboutFactStack', 'Core stack', { placeholder: 'TypeScript · React · NestJS' })}
          {text('aboutFactAvailable', 'Available for', { placeholder: 'Internships · Remote' })}
        </div>
        {text('aboutDividerLabel', 'Divider label', { placeholder: 'What I bring', maxLength: 80 })}

        <Field
          label="Focus cards"
          hint="Heading + sentence pairs in the “What I bring” grid. When there are none, the capability statements below are used instead."
        >
          <div className="space-y-2">
            {focusBlocks.fields.map((block, index) => (
              <div key={block.id} className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    aria-label={`Focus card ${index + 1} heading`}
                    placeholder="Heading"
                    maxLength={120}
                    {...register(`aboutFocusBlocks.${index}.heading`)}
                  />
                  <Textarea
                    aria-label={`Focus card ${index + 1} text`}
                    placeholder="Short supporting sentence"
                    rows={2}
                    maxLength={600}
                    {...register(`aboutFocusBlocks.${index}.body`)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => focusBlocks.remove(index)}
                  aria-label={`Remove focus card ${index + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => focusBlocks.append({ heading: '', body: '' })}
            >
              <Plus className="h-3.5 w-3.5" /> Add focus card
            </Button>
          </div>
        </Field>

        <Field
          label="Capability statements"
          htmlFor="aboutCapabilities"
          hint="Used when there are no focus cards. “Label: description” shows the label as a heading."
        >
          <Controller
            control={control}
            name="aboutCapabilities"
            render={({ field }) => (
              <ListEditor id="aboutCapabilities" value={field.value} onChange={field.onChange} />
            )}
          />
        </Field>
      </FormSection>

      <FormSection title="Photo & CV">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Profile photo" htmlFor="avatarUrl" error={errors.avatarUrl?.message}>
            <div className="flex items-center gap-3">
              <Input
                id="avatarUrl"
                type="url"
                placeholder="https://…"
                {...register('avatarUrl', urlRules)}
              />
              <UploadButton
                accept={ACCEPT.images}
                onUploaded={(media) => setValue('avatarUrl', media.url, { shouldDirty: true })}
              />
            </div>
          </Field>
          <Field label="CV (PDF or image)" htmlFor="resumeUrl" error={errors.resumeUrl?.message}>
            <div className="flex items-center gap-3">
              <Input
                id="resumeUrl"
                type="url"
                placeholder="https://…"
                {...register('resumeUrl', urlRules)}
              />
              <UploadButton
                accept={ACCEPT.document}
                onUploaded={(media) => setValue('resumeUrl', media.url, { shouldDirty: true })}
              />
            </div>
          </Field>
        </div>
      </FormSection>

      <FormSection title="Social links">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {(
            [
              ['github', 'GitHub'],
              ['linkedin', 'LinkedIn'],
              ['x', 'X / Twitter'],
              ['website', 'Website'],
            ] as const
          ).map(([key, label]) => (
            <Field
              key={key}
              label={label}
              htmlFor={`socials-${key}`}
              error={errors.socials?.[key]?.message}
            >
              <Input
                id={`socials-${key}`}
                type="url"
                placeholder="https://…"
                aria-invalid={errors.socials?.[key] ? true : undefined}
                {...register(`socials.${key}`, urlRules)}
              />
            </Field>
          ))}
        </div>
      </FormSection>

      <FormSection title="Contact">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {text('contactCTALabel', 'Email button label', {
            placeholder: 'Send me a message',
            maxLength: 60,
          })}
          {text('responseTime', 'Response time note', {
            placeholder: 'Usually replies within 24 hours',
            maxLength: 120,
          })}
        </div>
      </FormSection>

      <FormActions pending={update.isPending} disabled={!isDirty} submitLabel="Save profile" />
    </form>
  );
}
