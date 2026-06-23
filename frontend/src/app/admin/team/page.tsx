'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, X, Github, Linkedin, Users } from 'lucide-react';
import {
  useCreateTeamMember,
  useDeleteTeamMember,
  useTeam,
  useUpdateTeamMember,
} from '@/lib/api/team';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { TeamMember } from '@/lib/types';

const schema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    githubUrl: z.string().optional(),
    linkedinUrl: z.string().optional(),
  })
  .refine(
    (v) => Boolean(v.githubUrl?.trim()) || Boolean(v.linkedinUrl?.trim()),
    {
      message: 'Provide at least a GitHub or LinkedIn URL',
      path: ['githubUrl'],
    },
  );
type Form = z.infer<typeof schema>;

export default function AdminTeamPage() {
  const { data: team } = useTeam();
  const create = useCreateTeamMember();
  const update = useUpdateTeamMember();
  const del = useDeleteTeamMember();
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<TeamMember | null>(null);

  const onDelete = async () => {
    if (!pendingDelete) return;
    try {
      await del.mutateAsync(pendingDelete._id);
      toast.success('Removed');
      setPendingDelete(null);
    } catch {
      toast.error('Could not remove');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Admin</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Collaborators</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Reusable across projects — link the same person to multiple projects.
          </p>
        </div>
        {!showForm ? (
          <Button onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="h-4 w-4" /> Add collaborator
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

      {(team ?? []).length === 0 && !showForm ? (
        <EmptyState
          className="mt-8"
          icon={Users}
          title="No collaborators yet"
          description="Add people you've shipped projects with — they'll show on each project's detail page with GitHub and LinkedIn links."
          action={
            <Button onClick={() => { setEditing(null); setShowForm(true); }}>
              <Plus className="h-4 w-4" /> Add your first collaborator
            </Button>
          }
        />
      ) : null}

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove ${pendingDelete?.name ?? ''}?`}
        description="This collaborator will be removed from your roster and from any project they're linked to."
        confirmLabel="Remove"
        destructive
        onConfirm={onDelete}
      />

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(team ?? []).map((m) => (
          <div
            key={m._id}
            className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{m.name}</p>
              <div className="mt-1 flex items-center gap-3 text-[hsl(var(--muted-foreground))]">
                {m.githubUrl ? (
                  <a
                    href={m.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${m.name} on GitHub`}
                    className="hover:text-[hsl(var(--foreground))]"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                ) : null}
                {m.linkedinUrl ? (
                  <a
                    href={m.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${m.name} on LinkedIn`}
                    className="hover:text-[hsl(var(--foreground))]"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
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
              <Button size="icon" variant="ghost" onClick={() => setPendingDelete(m)} aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
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
      githubUrl: member?.githubUrl ?? '',
      linkedinUrl: member?.linkedinUrl ?? '',
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-6 space-y-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{member ? 'Edit collaborator' : 'New collaborator'}</h3>
        <Button type="button" variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="t-name">Name</Label>
        <Input id="t-name" {...register('name')} />
        {errors.name ? <p className="text-xs text-red-500">{errors.name.message}</p> : null}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="t-github">GitHub URL</Label>
          <Input id="t-github" {...register('githubUrl')} placeholder="https://github.com/..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="t-linkedin">LinkedIn URL</Label>
          <Input id="t-linkedin" {...register('linkedinUrl')} placeholder="https://linkedin.com/in/..." />
        </div>
      </div>
      {errors.githubUrl?.message ? (
        <p className="text-xs text-red-500">{errors.githubUrl.message}</p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {member ? 'Save' : 'Add collaborator'}
        </Button>
      </div>
    </form>
  );
}
