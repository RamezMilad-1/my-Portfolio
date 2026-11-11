'use client';

import { Github, Linkedin, Pencil, Plus, Trash2, Users, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Field } from '@/components/admin/field';
import { required, urlRules } from '@/components/admin/forms/form-utils';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeleteTeamMember, useSaveTeamMember, useTeam } from '@/lib/admin/queries';
import { errorMessage } from '@/lib/api/client';
import type { TeamMember, TeamMemberInput } from '@/lib/types';

function TeamMemberForm({ member, onDone }: { member: TeamMember | null; onDone: () => void }) {
  const save = useSaveTeamMember();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamMemberInput>({
    defaultValues: {
      name: member?.name ?? '',
      githubUrl: member?.githubUrl ?? '',
      linkedinUrl: member?.linkedinUrl ?? '',
    },
  });

  const onSubmit = handleSubmit(async (input) => {
    try {
      await save.mutateAsync({ id: member?._id, input });
      toast.success(member ? 'Collaborator updated' : 'Collaborator added');
      onDone();
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save'));
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-medium">{member ? 'Edit collaborator' : 'New collaborator'}</h2>
        <Button type="button" variant="ghost" size="icon" onClick={onDone} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Field label="Name" htmlFor="member-name" error={errors.name?.message}>
        <Input
          id="member-name"
          maxLength={120}
          aria-invalid={errors.name ? true : undefined}
          {...register('name', required('Name'))}
        />
      </Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="GitHub URL" htmlFor="member-github" error={errors.githubUrl?.message}>
          <Input
            id="member-github"
            type="url"
            placeholder="https://github.com/…"
            {...register('githubUrl', urlRules)}
          />
        </Field>
        <Field label="LinkedIn URL" htmlFor="member-linkedin" error={errors.linkedinUrl?.message}>
          <Input
            id="member-linkedin"
            type="url"
            placeholder="https://linkedin.com/in/…"
            {...register('linkedinUrl', urlRules)}
          />
        </Field>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {member ? 'Save' : 'Add collaborator'}
        </Button>
      </div>
    </form>
  );
}

export default function AdminTeamPage() {
  const { data: team, isLoading } = useTeam();
  const remove = useDeleteTeamMember();
  // `undefined` = no form, `null` = new member, otherwise the member being edited.
  const [editing, setEditing] = useState<TeamMember | null | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<TeamMember | null>(null);

  const onDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync(pendingDelete._id);
      toast.success(`Removed ${pendingDelete.name}`);
      setPendingDelete(null);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not remove'));
    }
  };

  const addButton = (
    <Button onClick={() => setEditing(null)}>
      <Plus className="h-4 w-4" /> Add collaborator
    </Button>
  );

  return (
    <div>
      <PageHeader
        title="Collaborators"
        description="People you've built projects with. Link the same person to several projects."
        action={editing === undefined ? addButton : undefined}
      />

      {editing !== undefined ? (
        <TeamMemberForm
          key={editing?._id ?? 'new'}
          member={editing}
          onDone={() => setEditing(undefined)}
        />
      ) : null}

      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (team ?? []).length === 0 && editing === undefined ? (
        <EmptyState
          className="mt-8"
          icon={Users}
          title="No collaborators yet"
          description="Add people you've shipped projects with — they appear on each project's page with their links."
          action={addButton}
        />
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {team?.map((member) => (
            <li
              key={member._id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{member.name}</p>
                <div className="mt-1 flex items-center gap-3 text-muted-foreground">
                  {member.githubUrl ? (
                    <a
                      href={member.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on GitHub`}
                      className="hover:text-foreground"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  ) : null}
                  {member.linkedinUrl ? (
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on LinkedIn`}
                      className="hover:text-foreground"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setEditing(member)}
                  aria-label={`Edit ${member.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setPendingDelete(member)}
                  aria-label={`Remove ${member.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove ${pendingDelete?.name ?? ''}?`}
        description="They're removed from the roster and from every project they're linked to."
        confirmLabel="Remove"
        destructive
        onConfirm={onDelete}
      />
    </div>
  );
}
