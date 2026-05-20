'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2, X } from 'lucide-react';
import { useProfile, useUpdateProfile } from '@/lib/api/profile';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUploadMedia } from '@/lib/api/media';

const schema = z.object({
  displayName: z.string().min(1),
  headline: z.string().min(1),
  bio: z.string().optional(),
  education: z.string().optional(),
  availability: z.string().optional(),
  email: z.string().optional(),
  avatarUrl: z.string().optional(),
  resumeUrl: z.string().optional(),
  socials: z.object({
    github: z.string().optional(),
    linkedin: z.string().optional(),
    x: z.string().optional(),
    website: z.string().optional(),
  }),
  headlines: z.array(z.string()).default([]),
  stats: z.object({
    yearsCoding: z.number().int().min(0).optional(),
    projectsShipped: z.number().int().min(0).optional(),
    technologies: z.number().int().min(0).optional(),
  }),
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
      education: '',
      availability: '',
      email: '',
      avatarUrl: '',
      resumeUrl: '',
      socials: { github: '', linkedin: '', x: '', website: '' },
      headlines: [],
      stats: {},
    },
  });

  const headlines = form.watch('headlines');
  const [headlineInput, setHeadlineInput] = useState('');

  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName,
        headline: profile.headline,
        bio: profile.bio ?? '',
        education: profile.education ?? '',
        availability: profile.availability ?? '',
        email: profile.email ?? '',
        avatarUrl: profile.avatarUrl ?? '',
        resumeUrl: profile.resumeUrl ?? '',
        socials: {
          github: profile.socials?.github ?? '',
          linkedin: profile.socials?.linkedin ?? '',
          x: profile.socials?.x ?? '',
          website: profile.socials?.website ?? '',
        },
        headlines: profile.headlines ?? [],
        stats: {
          yearsCoding: profile.stats?.yearsCoding,
          projectsShipped: profile.stats?.projectsShipped,
          technologies: profile.stats?.technologies,
        },
      });
    }
  }, [profile, form]);

  const onSubmit = async (values: Form) => {
    try {
      // strip empty stat fields so they're omitted from the patch
      const stats = Object.fromEntries(
        Object.entries(values.stats).filter(
          ([, v]) => typeof v === 'number' && !Number.isNaN(v),
        ),
      );
      await update.mutateAsync({ ...values, stats });
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

  const addHeadline = () => {
    const v = headlineInput.trim();
    if (!v) return;
    form.setValue('headlines', [...headlines, v], { shouldDirty: true });
    setHeadlineInput('');
  };
  const removeHeadline = (i: number) => {
    form.setValue(
      'headlines',
      headlines.filter((_, idx) => idx !== i),
      { shouldDirty: true },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-3 w-12" />
          <Skeleton className="mt-3 h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

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
          <Label htmlFor="headline">Headline (fallback for typewriter)</Label>
          <Input id="headline" {...form.register('headline')} />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" rows={5} {...form.register('bio')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="education">Education</Label>
          <Input
            id="education"
            placeholder="B.Sc. Computer Science · GUC · Expected 2027"
            {...form.register('education')}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="availability">Availability</Label>
          <Input
            id="availability"
            placeholder="Available for internships"
            {...form.register('availability')}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label>Typewriter phrases</Label>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            These rotate in the hero, typed letter-by-letter. Add several short
            roles (e.g. &quot;Full-Stack Developer&quot;, &quot;CS Student&quot;,
            &quot;React enthusiast&quot;). If empty, the headline above is used.
          </p>
        </div>
        <ul className="space-y-2">
          {headlines.map((h, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="flex-1 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm">
                {h}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeHeadline(i)}
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Input
            value={headlineInput}
            onChange={(e) => setHeadlineInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addHeadline();
              }
            }}
            placeholder="Full-Stack Developer"
          />
          <Button type="button" variant="outline" onClick={addHeadline}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label>Stats (optional overrides)</Label>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Leave a field blank to let the site compute it automatically.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="yearsCoding">Years coding</Label>
            <Input
              id="yearsCoding"
              type="number"
              {...form.register('stats.yearsCoding', { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="projectsShipped">Projects shipped</Label>
            <Input
              id="projectsShipped"
              type="number"
              {...form.register('stats.projectsShipped', { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="technologies">Technologies</Label>
            <Input
              id="technologies"
              type="number"
              {...form.register('stats.technologies', { valueAsNumber: true })}
            />
          </div>
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

      <div className="flex justify-end">
        <Button type="submit">Save profile</Button>
      </div>
    </form>
  );
}
