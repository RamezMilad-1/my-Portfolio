'use client';

import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Input, Select, Textarea } from '@/components/ui/input';
import { useSaveProject } from '@/lib/admin/queries';
import { errorMessage } from '@/lib/api/client';
import type { Project, ProjectInput } from '@/lib/types';
import { Field, FormSection } from '../field';
import { FormActions } from '../form-actions';
import { ListEditor } from '../list-editor';
import { formValues, required, urlRules } from './form-utils';
import { ProjectMediaField } from './project-media-field';
import { TeamPicker } from './team-picker';

const LIST = '/admin/projects';
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Editable fields. `position` is left out on purpose: drag-and-drop on the list owns ordering. */
type ProjectFormValues = Omit<ProjectInput, 'position' | 'team'> & { team: string[] };

const EMPTY: ProjectFormValues = {
  slug: '',
  name: '',
  tagline: '',
  category: '',
  role: '',
  problem: '',
  description: '',
  architecture: '',
  outcome: '',
  tech: [],
  features: [],
  highlights: [],
  githubUrl: '',
  liveUrl: '',
  liveLabel: '',
  sourceLabel: '',
  coverImageUrl: '',
  media: [],
  team: [],
  isFeatured: false,
  status: 'published',
};

const toFormValues = (project?: Project): ProjectFormValues =>
  formValues(
    EMPTY,
    project && {
      ...project,
      media: project.media.map((media) => media._id),
      team: project.team.map((link) => link.memberId._id),
    },
  );

/** "My Cool App!" → "my-cool-app" */
const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const save = useSaveProject();
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormValues>({ defaultValues: toFormValues(project) });

  const onSubmit = handleSubmit(async ({ team, ...values }) => {
    try {
      const input = { ...values, team: team.map((memberId) => ({ memberId })) };
      const saved = await save.mutateAsync({ id: project?._id, input });
      toast.success(project ? 'Project updated' : 'Project created');
      router.push(project ? LIST : `${LIST}/${saved._id}`);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save'));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <FormSection title="Basics">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Name" htmlFor="name" error={errors.name?.message}>
            <Input
              id="name"
              maxLength={120}
              aria-invalid={errors.name ? true : undefined}
              {...register('name', {
                ...required('Name'),
                onBlur: (event: { target: HTMLInputElement }) => {
                  if (!getValues('slug')) {
                    setValue('slug', slugify(event.target.value), { shouldValidate: true });
                  }
                },
              })}
            />
          </Field>
          <Field
            label="Slug"
            htmlFor="slug"
            hint="The page address: /projects/your-slug"
            error={errors.slug?.message}
          >
            <Input
              id="slug"
              maxLength={80}
              placeholder="my-project"
              aria-invalid={errors.slug ? true : undefined}
              {...register('slug', {
                validate: (slug) =>
                  (SLUG.test(slug) && slug !== 'all') ||
                  'Lowercase letters, digits and single dashes (and not “all”)',
              })}
            />
          </Field>
          <Field label="Tagline" htmlFor="tagline" className="md:col-span-2">
            <Input id="tagline" maxLength={300} {...register('tagline')} />
          </Field>
          <Field
            label="Category"
            htmlFor="category"
            hint="Optional badge on the card, e.g. “Full-Stack Web”."
          >
            <Input id="category" maxLength={60} {...register('category')} />
          </Field>
          <Field label="Your role" htmlFor="role">
            <Input id="role" maxLength={120} {...register('role')} />
          </Field>
          <Field label="Status" htmlFor="status" hint="Drafts are only visible here.">
            <Select id="status" {...register('status')}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </Select>
          </Field>
          <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium">
            <input type="checkbox" className="h-4 w-4" {...register('isFeatured')} />
            Featured — listed before the other projects
          </label>
        </div>
      </FormSection>

      <FormSection title="Links">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="GitHub URL" htmlFor="githubUrl" error={errors.githubUrl?.message}>
            <Input
              id="githubUrl"
              type="url"
              placeholder="https://github.com/…"
              aria-invalid={errors.githubUrl ? true : undefined}
              {...register('githubUrl', urlRules)}
            />
          </Field>
          <Field label="Live URL" htmlFor="liveUrl" error={errors.liveUrl?.message}>
            <Input
              id="liveUrl"
              type="url"
              placeholder="https://…"
              aria-invalid={errors.liveUrl ? true : undefined}
              {...register('liveUrl', urlRules)}
            />
          </Field>
          <Field label="Source button label" htmlFor="sourceLabel" hint="Empty shows “Source”.">
            <Input
              id="sourceLabel"
              maxLength={40}
              placeholder="Source"
              {...register('sourceLabel')}
            />
          </Field>
          <Field label="Live button label" htmlFor="liveLabel" hint="Empty shows “Live Demo”.">
            <Input
              id="liveLabel"
              maxLength={40}
              placeholder="Live Demo"
              {...register('liveLabel')}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Case study">
        <Field
          label="Problem"
          htmlFor="problem"
          hint="1–2 sentences: what does this project solve?"
        >
          <Textarea id="problem" rows={3} maxLength={2000} {...register('problem')} />
        </Field>
        <Field label="Description" htmlFor="description" hint="Markdown is supported.">
          <Textarea id="description" rows={6} maxLength={20000} {...register('description')} />
        </Field>
        <Field label="Architecture" htmlFor="architecture" hint="Markdown is supported.">
          <Textarea id="architecture" rows={6} maxLength={20000} {...register('architecture')} />
        </Field>
        <Field
          label="Outcome"
          htmlFor="outcome"
          hint="What shipped, who used it, what you learned."
        >
          <Textarea id="outcome" rows={3} maxLength={2000} {...register('outcome')} />
        </Field>
      </FormSection>

      <FormSection title="Lists">
        <Field label="Tech stack" htmlFor="tech" hint="The first four show on the project card.">
          <Controller
            control={control}
            name="tech"
            render={({ field }) => (
              <ListEditor
                id="tech"
                variant="chips"
                value={field.value}
                onChange={field.onChange}
                placeholder="React, NestJS, MongoDB…"
              />
            )}
          />
        </Field>
        <Field
          label="Key highlights"
          htmlFor="highlights"
          hint="Short, punchy bullets on the project page."
        >
          <Controller
            control={control}
            name="highlights"
            render={({ field }) => (
              <ListEditor
                id="highlights"
                value={field.value}
                onChange={field.onChange}
                placeholder="Cuts booking time from minutes to seconds"
              />
            )}
          />
        </Field>
        <Field label="Features" htmlFor="features">
          <Controller
            control={control}
            name="features"
            render={({ field }) => (
              <ListEditor
                id="features"
                value={field.value}
                onChange={field.onChange}
                placeholder="Multi-tier ticket booking…"
              />
            )}
          />
        </Field>
      </FormSection>

      <FormSection
        title="Images & videos"
        description="The gallery on the project page, in this order. Captions are shown with each item."
      >
        <Controller
          control={control}
          name="media"
          render={({ field: media }) => (
            <Controller
              control={control}
              name="coverImageUrl"
              render={({ field: cover }) => (
                <ProjectMediaField
                  value={media.value}
                  onChange={media.onChange}
                  cover={cover.value}
                  onCoverChange={cover.onChange}
                  projectId={project?._id}
                />
              )}
            />
          )}
        />
      </FormSection>

      <FormSection title="Collaborators">
        <Controller
          control={control}
          name="team"
          render={({ field }) => <TeamPicker value={field.value} onChange={field.onChange} />}
        />
      </FormSection>

      <FormActions
        cancelHref={LIST}
        pending={save.isPending}
        submitLabel={project ? 'Save changes' : 'Create project'}
      />
    </form>
  );
}
