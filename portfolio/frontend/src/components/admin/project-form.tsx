'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, X } from 'lucide-react';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  useCreateProject,
  useUpdateProject,
} from '@/lib/api/projects';
import { useTeam } from '@/lib/api/team';
import { useMediaList, useUploadMedia, useDeleteMedia } from '@/lib/api/media';
import { uploadsUrl } from '@/lib/utils';
import type { Project, TeamMember, Media } from '@/lib/types';

const schema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'lowercase, digits, dashes'),
  name: z.string().min(1),
  tagline: z.string().optional(),
  problem: z.string().optional(),
  description: z.string().optional(),
  architecture: z.string().optional(),
  outcome: z.string().optional(),
  tech: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  githubUrl: z.string().optional(),
  liveUrl: z.string().optional(),
  role: z.string().optional(),
  isFeatured: z.boolean().default(false),
  status: z.enum(['draft', 'published']).default('published'),
  position: z.number().int().default(0),
  team: z
    .array(z.object({ memberId: z.string() }))
    .default([]),
  media: z.array(z.string()).default([]),
});
type Form = z.infer<typeof schema>;

interface Props {
  project?: Project;
}

export function ProjectForm({ project }: Props) {
  const router = useRouter();
  const create = useCreateProject();
  const update = useUpdateProject();
  const { data: teamRoster } = useTeam();
  const { data: mediaList } = useMediaList();
  const upload = useUploadMedia();
  const delMedia = useDeleteMedia();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug: project?.slug ?? '',
      name: project?.name ?? '',
      tagline: project?.tagline ?? '',
      problem: project?.problem ?? '',
      description: project?.description ?? '',
      architecture: project?.architecture ?? '',
      outcome: project?.outcome ?? '',
      tech: project?.tech ?? [],
      features: project?.features ?? [],
      githubUrl: project?.githubUrl ?? '',
      liveUrl: project?.liveUrl ?? '',
      role: project?.role ?? '',
      isFeatured: project?.isFeatured ?? false,
      status: project?.status ?? 'published',
      position: project?.position ?? 0,
      team:
        project?.team?.map((t) => ({
          memberId: typeof t.memberId === 'string' ? t.memberId : t.memberId._id,
        })) ?? [],
      media: project?.media?.map((m) => m._id) ?? [],
    },
  });

  const tech = watch('tech');
  const features = watch('features');
  const teamLinks = watch('team');
  const selectedMedia = watch('media');

  const [techInput, setTechInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [pendingMediaDelete, setPendingMediaDelete] = useState<Media | null>(null);

  const onSubmit = async (values: Form) => {
    try {
      if (project) {
        await update.mutateAsync({ id: project._id, payload: values });
        toast.success('Project updated');
      } else {
        const created = await create.mutateAsync(values);
        toast.success('Project created');
        router.push(`/admin/projects/${created._id}`);
        return;
      }
      router.push('/admin/projects');
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

  const addTech = () => {
    const v = techInput.trim();
    if (!v) return;
    if (!tech.includes(v)) setValue('tech', [...tech, v], { shouldDirty: true });
    setTechInput('');
  };
  const removeTech = (t: string) => setValue('tech', tech.filter((x) => x !== t), { shouldDirty: true });

  const addFeature = () => {
    const v = featureInput.trim();
    if (!v) return;
    setValue('features', [...features, v], { shouldDirty: true });
    setFeatureInput('');
  };
  const removeFeature = (i: number) => {
    setValue('features', features.filter((_, idx) => idx !== i), { shouldDirty: true });
  };

  const addTeammate = (memberId: string) => {
    if (teamLinks.find((l) => l.memberId === memberId)) return;
    setValue('team', [...teamLinks, { memberId }], { shouldDirty: true });
  };
  const removeTeammate = (memberId: string) => {
    setValue('team', teamLinks.filter((l) => l.memberId !== memberId), { shouldDirty: true });
  };

  const handleUploadClick = async (file: File) => {
    try {
      const created = await upload.mutateAsync({ file, projectId: project?._id });
      setValue('media', [...(selectedMedia ?? []), created._id], { shouldDirty: true });
      toast.success('Uploaded');
    } catch {
      toast.error('Upload failed');
    }
  };

  const toggleMedia = (id: string) => {
    if ((selectedMedia ?? []).includes(id)) {
      setValue('media', selectedMedia.filter((x) => x !== id), { shouldDirty: true });
    } else {
      setValue('media', [...(selectedMedia ?? []), id], { shouldDirty: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register('name')} />
          {errors.name ? <p className="text-xs text-red-500">{errors.name.message}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register('slug')} placeholder="my-project" />
          {errors.slug ? <p className="text-xs text-red-500">{errors.slug.message}</p> : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tagline">Tagline</Label>
        <Input id="tagline" {...register('tagline')} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="githubUrl">GitHub URL</Label>
          <Input id="githubUrl" {...register('githubUrl')} placeholder="https://github.com/..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="liveUrl">Live URL</Label>
          <Input id="liveUrl" {...register('liveUrl')} placeholder="https://..." />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="role">Your role</Label>
          <Input id="role" {...register('role')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="position">Position</Label>
          <Input id="position" type="number" {...register('position', { valueAsNumber: true })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            {...register('status')}
            className="h-10 w-full rounded-md border border-[hsl(var(--input))] bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="flex items-center gap-2">
          <Controller
            control={control}
            name="isFeatured"
            render={({ field }) => (
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="h-4 w-4 rounded border-[hsl(var(--border))]"
              />
            )}
          />
          Featured on home page
        </Label>
      </div>

      <div className="space-y-2">
        <Label>Tech stack</Label>
        <div className="flex flex-wrap gap-1.5">
          {tech.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-2.5 py-0.5 text-xs"
            >
              {t}
              <button
                type="button"
                onClick={() => removeTech(t)}
                aria-label={`Remove ${t}`}
                className="rounded-full hover:bg-black/10"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTech();
              }
            }}
            placeholder="React, NestJS, MongoDB…"
          />
          <Button type="button" variant="outline" onClick={addTech}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Features</Label>
        <ul className="space-y-2">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="flex-1 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm">
                {f}
              </span>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(i)}>
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Input
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addFeature();
              }
            }}
            placeholder="Multi-tier ticket booking…"
          />
          <Button type="button" variant="outline" onClick={addFeature}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="problem">Problem (1–2 sentences — what does this project solve?)</Label>
        <Textarea
          id="problem"
          rows={3}
          placeholder="Concert-goers in Berlin had no reliable way to discover and book multi-tier tickets in one place."
          {...register('problem')}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description (markdown)</Label>
        <Textarea id="description" rows={6} {...register('description')} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="architecture">Architecture write-up (markdown)</Label>
        <Textarea id="architecture" rows={6} {...register('architecture')} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="outcome">Outcome (what shipped, who used it, what you learned — 1–3 sentences)</Label>
        <Textarea
          id="outcome"
          rows={3}
          placeholder="Used by ~40 students during the spring semester demo. Cut booking time from minutes to seconds and taught me Mongo transactions."
          {...register('outcome')}
        />
      </div>

      <TeamPicker teamRoster={teamRoster} teamLinks={teamLinks} onAdd={addTeammate} onRemove={removeTeammate} />

      <MediaPicker
        media={mediaList ?? []}
        selected={selectedMedia ?? []}
        onToggle={toggleMedia}
        onUpload={handleUploadClick}
        onDelete={(media) => setPendingMediaDelete(media)}
      />

      <ConfirmDialog
        open={!!pendingMediaDelete}
        onOpenChange={(open) => !open && setPendingMediaDelete(null)}
        title="Delete this media file?"
        description={
          pendingMediaDelete?.originalName
            ? `"${pendingMediaDelete.originalName}" will be permanently removed from your library.`
            : 'This file will be permanently removed from your library.'
        }
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (!pendingMediaDelete) return;
          try {
            await delMedia.mutateAsync(pendingMediaDelete._id);
            toast.success('Deleted');
            setPendingMediaDelete(null);
          } catch {
            toast.error('Could not delete');
          }
        }}
      />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/projects')}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {project ? 'Save changes' : 'Create project'}
        </Button>
      </div>
    </form>
  );
}

function TeamPicker({
  teamRoster,
  teamLinks,
  onAdd,
  onRemove,
}: {
  teamRoster: TeamMember[] | undefined;
  teamLinks: { memberId: string }[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const byId = new Map((teamRoster ?? []).map((m) => [m._id, m]));

  return (
    <div className="space-y-2">
      <Label>Collaborators</Label>
      <div className="space-y-2">
        {teamLinks.map((link) => {
          const m = byId.get(link.memberId);
          return (
            <div
              key={link.memberId}
              className="flex items-center justify-between gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2"
            >
              <span className="text-sm font-medium">{m?.name ?? link.memberId}</span>
              <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(link.memberId)}>
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </div>
          );
        })}
      </div>
      <select
        onChange={(e) => {
          if (e.target.value) {
            onAdd(e.target.value);
            e.target.value = '';
          }
        }}
        className="h-10 w-full rounded-md border border-[hsl(var(--input))] bg-transparent px-3 text-sm"
      >
        <option value="">Add a collaborator…</option>
        {(teamRoster ?? [])
          .filter((m) => !teamLinks.find((l) => l.memberId === m._id))
          .map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
      </select>
    </div>
  );
}

function MediaPicker({
  media,
  selected,
  onToggle,
  onUpload,
  onDelete,
}: {
  media: Media[];
  selected: string[];
  onToggle: (id: string) => void;
  onUpload: (file: File) => Promise<void>;
  onDelete: (media: Media) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Media (images / videos)</Label>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[hsl(var(--border))] px-3 py-1.5 text-xs hover:bg-[hsl(var(--muted))]">
          <Plus className="h-3.5 w-3.5" /> Upload
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) await onUpload(file);
              e.target.value = '';
            }}
          />
        </label>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {media.map((m) => {
          const isSel = selected.includes(m._id);
          return (
            <div key={m._id} className="relative">
              <button
                type="button"
                onClick={() => onToggle(m._id)}
                className={`group relative aspect-video w-full overflow-hidden rounded-md border ${
                  isSel ? 'border-[hsl(var(--accent))] ring-2 ring-[hsl(var(--accent))]' : 'border-[hsl(var(--border))]'
                }`}
              >
                {m.kind === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={uploadsUrl(m.url)} alt={m.caption || ''} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-black/80 text-xs text-white">
                    VIDEO
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => onDelete(m)}
                className="absolute right-1 top-1 hidden rounded-full bg-black/70 p-1 text-white group-hover:block"
                aria-label="Delete media"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          );
        })}
        {media.length === 0 ? (
          <p className="col-span-full text-xs text-[hsl(var(--muted-foreground))]">
            No media yet — upload one to attach it to this project.
          </p>
        ) : null}
      </div>
    </div>
  );
}
