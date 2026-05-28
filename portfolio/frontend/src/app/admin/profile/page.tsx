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
import { SectionHeaderEditor } from '@/components/admin/section-header-editor';

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
  aboutTagline: z.string().optional(),
  aboutLede: z.string().optional(),
  aboutFactLocation: z.string().optional(),
  aboutFactStack: z.string().optional(),
  aboutFactAvailable: z.string().optional(),
  aboutCapabilities: z.array(z.string()).default([]),
  aboutFocusKicker: z.string().optional(),
  aboutFocusTitle: z.string().optional(),
  aboutFocusSubtitle: z.string().optional(),
  aboutFocusBlocks: z
    .array(
      z.object({
        heading: z.string().optional(),
        body: z.string().optional(),
      }),
    )
    .default([]),
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
      aboutTagline: '',
      aboutLede: '',
      aboutFactLocation: '',
      aboutFactStack: '',
      aboutFactAvailable: '',
      aboutCapabilities: [],
      aboutFocusKicker: '',
      aboutFocusTitle: '',
      aboutFocusSubtitle: '',
      aboutFocusBlocks: [],
    },
  });

  const headlines = form.watch('headlines');
  const [headlineInput, setHeadlineInput] = useState('');

  const capabilities = form.watch('aboutCapabilities');
  const [capabilityInput, setCapabilityInput] = useState('');
  const focusBlocks = form.watch('aboutFocusBlocks');
  const [focusHeadingInput, setFocusHeadingInput] = useState('');
  const [focusBodyInput, setFocusBodyInput] = useState('');

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
        aboutTagline: profile.aboutTagline ?? '',
        aboutLede: profile.aboutLede ?? '',
        aboutFactLocation: profile.aboutFactLocation ?? '',
        aboutFactStack: profile.aboutFactStack ?? '',
        aboutFactAvailable: profile.aboutFactAvailable ?? '',
        aboutCapabilities: profile.aboutCapabilities ?? [],
        aboutFocusKicker: profile.aboutFocusKicker ?? '',
        aboutFocusTitle: profile.aboutFocusTitle ?? '',
        aboutFocusSubtitle: profile.aboutFocusSubtitle ?? '',
        aboutFocusBlocks: profile.aboutFocusBlocks ?? [],
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

  const addCapability = () => {
    const v = capabilityInput.trim();
    if (!v) return;
    form.setValue('aboutCapabilities', [...capabilities, v], {
      shouldDirty: true,
    });
    setCapabilityInput('');
  };
  const removeCapability = (i: number) => {
    form.setValue(
      'aboutCapabilities',
      capabilities.filter((_, idx) => idx !== i),
      { shouldDirty: true },
    );
  };

  const addFocusBlock = () => {
    const heading = focusHeadingInput.trim();
    const body = focusBodyInput.trim();
    if (!heading && !body) return;
    form.setValue('aboutFocusBlocks', [...(focusBlocks ?? []), { heading, body }], {
      shouldDirty: true,
    });
    setFocusHeadingInput('');
    setFocusBodyInput('');
  };

  const updateFocusBlock = (
    index: number,
    field: 'heading' | 'body',
    value: string,
  ) => {
    form.setValue(
      'aboutFocusBlocks',
      (focusBlocks ?? []).map((block, idx) =>
        idx === index ? { ...block, [field]: value } : block,
      ),
      { shouldDirty: true },
    );
  };

  const removeFocusBlock = (index: number) => {
    form.setValue(
      'aboutFocusBlocks',
      (focusBlocks ?? []).filter((_, idx) => idx !== index),
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
          <Label htmlFor="headline">Hero subtitle</Label>
          <p className="-mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            One-liner shown under the big role headline in the hero.
          </p>
          <Input id="headline" {...form.register('headline')} />
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
          <Label>Hero role</Label>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            The first phrase here is shown as the big role headline in the
            hero (e.g. &quot;Full-Stack Developer&quot;). Extra phrases are
            kept for future use but not currently displayed. If empty, a
            sensible default is used.
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

      {/* About content — every personal string that the public About section reads. */}
      <div className="space-y-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
            About content
          </h2>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Every personal string shown in the About section. Leave any field
            blank to fall back to the site default.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="aboutTagline">Identity tagline</Label>
          <p className="-mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            Shown next to your name in the About recruiter card.
          </p>
          <Input
            id="aboutTagline"
            placeholder="— Full-stack TypeScript developer"
            {...form.register('aboutTagline')}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="aboutLede">Lede (one big sentence)</Label>
          <p className="-mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            The large confident opener of your About prose.
          </p>
          <Textarea
            id="aboutLede"
            rows={3}
            placeholder="I build production-grade web apps end-to-end — typed all the way through, with the kind of detail that holds up six months later."
            {...form.register('aboutLede')}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">About body</Label>
          <p className="-mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            Renders as paragraphs under the lede. Separate paragraphs with a
            blank line.
          </p>
          <Textarea
            id="bio"
            rows={7}
            placeholder={
              'Most of my time goes into TypeScript: React or Next.js on the front, NestJS on the back…\n\nI’m at the stage where I want to push past student projects into real work…'
            }
            {...form.register('bio')}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="aboutFactLocation">Location fact</Label>
            <Input
              id="aboutFactLocation"
              placeholder="Cairo, Egypt · GMT+2"
              {...form.register('aboutFactLocation')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="aboutFactStack">Core stack fact</Label>
            <Input
              id="aboutFactStack"
              placeholder="TypeScript · React · Next.js · NestJS"
              {...form.register('aboutFactStack')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="aboutFactAvailable">Available-for fact</Label>
            <Input
              id="aboutFactAvailable"
              placeholder="Internships · Junior · Remote"
              {...form.register('aboutFactAvailable')}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label>What I can ship</Label>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              Outcome-oriented capability statements shown as bullets. Leave
              empty to fall back to the four site defaults.
            </p>
          </div>
          <ul className="space-y-2">
            {capabilities.map((c, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="flex-1 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm">
                  {c}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCapability(i)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Input
              value={capabilityInput}
              onChange={(e) => setCapabilityInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCapability();
                }
              }}
              placeholder="Full-stack apps from Figma to deploy — typed APIs, accessible UIs, clean builds."
            />
            <Button type="button" variant="outline" onClick={addCapability}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label>Focus section</Label>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              Optional recruiter-facing override for the public About focus cards.
              Leave blocks empty to use the bullet statements above.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="aboutFocusKicker">Kicker</Label>
              <Input
                id="aboutFocusKicker"
                placeholder="What I can ship"
                {...form.register('aboutFocusKicker')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="aboutFocusTitle">Title</Label>
              <Input
                id="aboutFocusTitle"
                placeholder="Reliable product work"
                {...form.register('aboutFocusTitle')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="aboutFocusSubtitle">Subtitle</Label>
              <Input
                id="aboutFocusSubtitle"
                placeholder="Short supporting sentence"
                {...form.register('aboutFocusSubtitle')}
              />
            </div>
          </div>

          <ul className="space-y-2">
            {(focusBlocks ?? []).map((block, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    value={block.heading ?? ''}
                    onChange={(event) =>
                      updateFocusBlock(index, 'heading', event.target.value)
                    }
                    placeholder="Heading"
                  />
                  <Textarea
                    value={block.body ?? ''}
                    onChange={(event) =>
                      updateFocusBlock(index, 'body', event.target.value)
                    }
                    placeholder="Short supporting sentence"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFocusBlock(index)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]">
            <Input
              value={focusHeadingInput}
              onChange={(event) => setFocusHeadingInput(event.target.value)}
              placeholder="Heading (optional)"
            />
            <Input
              value={focusBodyInput}
              onChange={(event) => setFocusBodyInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addFocusBlock();
                }
              }}
              placeholder="Short supporting sentence"
            />
            <Button type="button" variant="outline" onClick={addFocusBlock}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
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

      <SectionHeaderEditor
        label="About section header"
        description="Shown above the About section on the public homepage. Leave blank to use the defaults."
        fields={{
          kicker: 'aboutKicker',
          title: 'aboutTitle',
          subtitle: 'aboutSubtitle',
        }}
        defaults={{
          kicker: 'About me',
          title: "A developer with a designer's eye",
          subtitle:
            'I build full-stack web apps that ship — and look like they were designed on purpose.',
        }}
      />

      <SectionHeaderEditor
        label="Contact section header"
        description="Shown above the Contact section on the public homepage. Leave blank to use the defaults."
        fields={{
          kicker: 'contactKicker',
          title: 'contactTitle',
          subtitle: 'contactSubtitle',
        }}
        defaults={{
          kicker: 'Get in touch',
          title: "Let's build something",
          subtitle:
            'Open to internships, well-scoped student projects, and ambitious side projects.',
        }}
      />
    </form>
  );
}
