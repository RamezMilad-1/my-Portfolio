'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
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
    },
  });

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
      });
    }
  }, [profile, form]);

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
          <Label htmlFor="headline">Headline</Label>
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
            placeholder="Open to internships and junior roles in Cairo / remote"
            {...form.register('availability')}
          />
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
