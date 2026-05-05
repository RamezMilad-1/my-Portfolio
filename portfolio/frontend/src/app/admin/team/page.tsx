'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import {
  useCreateTeamMember,
  useDeleteTeamMember,
  useTeam,
  useUpdateTeamMember,
} from '@/lib/api/team';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { uploadsUrl } from '@/lib/utils';
import type { TeamMember } from '@/lib/types';

const schema = z.object({
  name: z.string().min(1),
  role: z.string().optional(),
  githubUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  avatarUrl: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export default function AdminTeamPage() {
  const { data: team } = useTeam();
  const create = useCreateTeamMember();
  const update = useUpdateTeamMember();
  const del = useDeleteTeamMember();
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [showForm, setShowForm] = useState(false);

  const onDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name}?`)) return;
    try {
      await del.mutateAsync(id);
      toast.success('Removed');
    } catch {
      toast.error('Could not remove');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Admin</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Team roster</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Reusable across projects — link the same person to multiple projects.
          </p>
        </div>
        {!showForm ? (
          <Button onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="h-4 w-4" /> Add member
          </Button>
        ) : null}
      </div>

      {showForm ? (
        <TeamForm
          member={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSubmit={async (values) => {
            try {
              if (editing) {
                await update.mutateAsync({ id: editing._id, payload: values });
                toast.success('Updated');
              } else {
                await create.mutateAsync(values);
                toast.success('Added');
              }
              setShowForm(false);
              setEditing(null);
            } catch {
              toast.error('Could not save');
            }
          }}
        />
      ) : null}

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(team ?? []).map((m) => (
          <div
            key={m._id}
            className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3"
          >
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
              {m.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={uploadsUrl(m.avatarUrl)} alt={m.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold">
                  {m.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{m.name}</p>
              <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">{m.role}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => { setEditing(m); setShowForm(true); }}
                aria-label="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onDelete(m._id, m.name)} aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
        {(team ?? []).length === 0 ? (
          <p className="col-span-full text-sm text-[hsl(var(--muted-foreground))]">
            No team members yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function TeamForm({
  member,
  onSubmit,
  onClose,
}: {
  member: TeamMember | null;
  onSubmit: (values: Form) => Promise<void>;
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: member?.name ?? '',
      role: member?.role ?? '',
      githubUrl: member?.githubUrl ?? '',
      linkedinUrl: member?.linkedinUrl ?? '',
      avatarUrl: member?.avatarUrl ?? '',
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-6 space-y-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{member ? 'Edit member' : 'New member'}</h3>
        <Button type="button" variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="t-name">Name</Label>
          <Input id="t-name" {...register('name')} />
          {errors.name ? <p className="text-xs text-red-500">{errors.name.message}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="t-role">Role</Label>
          <Input id="t-role" {...register('role')} placeholder="Backend developer" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="t-github">GitHub URL</Label>
          <Input id="t-github" {...register('githubUrl')} placeholder="https://github.com/..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="t-linkedin">LinkedIn URL</Label>
          <Input id="t-linkedin" {...register('linkedinUrl')} placeholder="https://linkedin.com/in/..." />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="t-avatar">Avatar URL (or path under /uploads)</Label>
          <Input id="t-avatar" {...register('avatarUrl')} placeholder="/uploads/images/..." />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {member ? 'Save' : 'Add member'}
        </Button>
      </div>
    </form>
  );
}
