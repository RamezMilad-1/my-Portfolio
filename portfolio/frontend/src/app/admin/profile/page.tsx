'use client';

import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { useProfile, useUpdateProfile } from '@/lib/api/profile';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useUploadMedia } from '@/lib/api/media';

const skillItem = z.object({ name: z.string(), level: z.string().optional() });
const skillCategory = z.object({ category: z.string(), items: z.array(skillItem) });
const timelineEntry = z.object({
  year: z.string(),
  title: z.string(),
  body: z.string().optional(),
});

const schema = z.object({
  displayName: z.string().min(1),
  headline: z.string().min(1),
  bio: z.string().optional(),
  email: z.string().optional(),
  avatarUrl: z.string().optional(),
  resumeUrl: z.string().optional(),
  socials: z.object({
    github: z.string().optional(),
    linkedin: z.string().optional(),
    x: z.string().optional(),
    website: z.string().optional(),
  }),
  skills: z.array(skillCategory),
  timeline: z.array(timelineEntry),
});
type Form = z.infer<typeof schema>;

export default function AdminProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();
  const upload = useUploadMedia();

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: '',
      headline: '',
      bio: '',
      email: '',
      avatarUrl: '',
      resumeUrl: '',
      socials: { github: '', linkedin: '', x: '', website: '' },
      skills: [],
      timeline: [],
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName,
        headline: profile.headline,
        bio: profile.bio ?? '',
        email: profile.email ?? '',
        avatarUrl: profile.avatarUrl ?? '',
        resumeUrl: profile.resumeUrl ?? '',
        socials: {
          github: profile.socials?.github ?? '',
          linkedin: profile.socials?.linkedin ?? '',
          x: profile.socials?.x ?? '',
          website: profile.socials?.website ?? '',
        },
        skills: profile.skills ?? [],
        timeline: profile.timeline ?? [],
      });
    }
  }, [profile, form]);

  const skills = useFieldArray({ control: form.control, name: 'skills' });
  const timeline = useFieldArray({ control: form.control, name: 'timeline' });

  const onSubmit = async (values: Form) => {
    try {
      await update.mutateAsync(values);
      toast.success('Profile updated');
    } catch {
      toast.error('Could not save');
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      const m = await upload.mutateAsync({ file });
      form.setValue('avatarUrl', m.url, { shouldDirty: true });
      toast.success('Avatar uploaded');
    } catch {
      toast.error('Upload failed');
    }
  };

  const uploadResume = async (file: File) => {
    try {
      const m = await upload.mutateAsync({ file });
      form.setValue('resumeUrl', m.url, { shouldDirty: true });
      toast.success('Resume uploaded');
    } catch {
      toast.error('Upload failed');
    }
  };

  if (isLoading) return <p className="text-sm">Loading…</p>;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Admin</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Profile</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="displayName">Display name</Label>
          <Input id="displayName" {...form.register('displayName')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" {...form.register('email')} />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="headline">Headline</Label>
          <Input id="headline" {...form.register('headline')} />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" rows={5} {...form.register('bio')} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Avatar</Label>
          <div className="flex items-center gap-3">
            <Input {...form.register('avatarUrl')} placeholder="/uploads/images/..." />
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[hsl(var(--border))] px-3 py-2 text-xs hover:bg-[hsl(var(--muted))]">
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) await uploadAvatar(f);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Resume (PDF or image)</Label>
          <div className="flex items-center gap-3">
            <Input {...form.register('resumeUrl')} placeholder="/uploads/..." />
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[hsl(var(--border))] px-3 py-2 text-xs hover:bg-[hsl(var(--muted))]">
              Upload
              <input
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) await uploadResume(f);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Social links</Label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input {...form.register('socials.github')} placeholder="GitHub URL" />
          <Input {...form.register('socials.linkedin')} placeholder="LinkedIn URL" />
          <Input {...form.register('socials.x')} placeholder="X / Twitter URL" />
          <Input {...form.register('socials.website')} placeholder="Website URL" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Skills</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => skills.append({ category: '', items: [] })}
          >
            <Plus className="h-3.5 w-3.5" /> Add category
          </Button>
        </div>
        {skills.fields.map((cat, ci) => (
          <SkillCategoryEditor
            key={cat.id}
            categoryIndex={ci}
            form={form}
            onRemoveCategory={() => skills.remove(ci)}
          />
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Timeline</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => timeline.append({ year: '', title: '', body: '' })}
          >
            <Plus className="h-3.5 w-3.5" /> Add entry
          </Button>
        </div>
        <ul className="space-y-2">
          {timeline.fields.map((t, i) => (
            <li
              key={t.id}
              className="grid grid-cols-1 gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 sm:grid-cols-[100px_1fr_auto]"
            >
              <Input {...form.register(`timeline.${i}.year`)} placeholder="2025" />
              <div className="space-y-2">
                <Input {...form.register(`timeline.${i}.title`)} placeholder="Title" />
                <Input {...form.register(`timeline.${i}.body`)} placeholder="Optional details" />
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => timeline.remove(i)}>
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Save profile</Button>
      </div>
    </form>
  );
}

function SkillCategoryEditor({
  categoryIndex,
  form,
  onRemoveCategory,
}: {
  categoryIndex: number;
  form: ReturnType<typeof useForm<Form>>;
  onRemoveCategory: () => void;
}) {
  const items = useFieldArray({
    control: form.control,
    name: `skills.${categoryIndex}.items`,
  });

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
      <div className="flex items-center gap-2">
        <Input
          className="flex-1"
          {...form.register(`skills.${categoryIndex}.category`)}
          placeholder="Category"
        />
        <Button type="button" variant="ghost" size="icon" onClick={onRemoveCategory}>
          <Trash2 className="h-3.5 w-3.5 text-red-500" />
        </Button>
      </div>
      <ul className="mt-2 space-y-1">
        {items.fields.map((it, i) => (
          <li key={it.id} className="flex gap-2">
            <Input
              {...form.register(`skills.${categoryIndex}.items.${i}.name`)}
              placeholder="Skill"
            />
            <Input
              className="w-32"
              {...form.register(`skills.${categoryIndex}.items.${i}.level`)}
              placeholder="Level"
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => items.remove(i)}>
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </Button>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => items.append({ name: '', level: '' })}
      >
        <Plus className="h-3.5 w-3.5" /> Add skill
      </Button>
    </div>
  );
}
