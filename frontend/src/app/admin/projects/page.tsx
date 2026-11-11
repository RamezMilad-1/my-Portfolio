'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ExternalLink,
  FolderKanban,
  Github,
  GripVertical,
  Pencil,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/admin/page-header';
import { SectionHeaderEditor } from '@/components/admin/section-header-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeleteProject, useProjects, useReorderProjects } from '@/lib/admin/queries';
import { errorMessage } from '@/lib/api/client';
import type { Project } from '@/lib/types';

function SortableRow({ project, onDelete }: { project: Project; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project._id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 p-3 ${isDragging ? 'relative z-10 bg-muted opacity-80' : 'hover:bg-muted/40'}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${project.name}`}
        className="flex h-8 w-8 flex-shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          {project.isFeatured ? (
            <Star
              aria-label="Featured"
              className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400"
            />
          ) : null}
          <span className="truncate font-medium">{project.name}</span>
          <Badge
            variant={project.status === 'published' ? 'default' : 'outline'}
            className="shrink-0"
          >
            {project.status}
          </Badge>
        </div>
        <p className="truncate text-xs text-muted-foreground">/projects/{project.slug}</p>
      </div>
      <div className="hidden flex-wrap gap-1 md:flex">
        {project.tech.slice(0, 3).map((tech) => (
          <Badge key={tech} className="text-[10px]">
            {tech}
          </Badge>
        ))}
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        {/* Outbound links are secondary here; on phones the row keeps room for the name. */}
        {project.githubUrl ? (
          <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Source on GitHub"
            >
              <Github className="h-3.5 w-3.5" />
            </a>
          </Button>
        ) : null}
        {project.liveUrl ? (
          <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Live site"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        ) : null}
        <Button asChild size="sm" variant="ghost">
          <Link href={`/admin/projects/${project._id}`} aria-label={`Edit ${project.name}`}>
            <Pencil className="h-3.5 w-3.5" />
          </Link>
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete} aria-label={`Delete ${project.name}`}>
          <Trash2 className="h-3.5 w-3.5 text-red-500" />
        </Button>
      </div>
    </li>
  );
}

export default function AdminProjectsPage() {
  const { data, isLoading } = useProjects();
  const reorder = useReorderProjects();
  const remove = useDeleteProject();
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  // Local order while a reorder request is in flight, so the list doesn't jump back.
  const [optimistic, setOptimistic] = useState<Project[] | null>(null);
  const projects = optimistic ?? [...(data ?? [])].sort((a, b) => a.position - b.position);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = projects.findIndex((project) => project._id === active.id);
    const to = projects.findIndex((project) => project._id === over.id);
    if (from === -1 || to === -1) return;

    const next = arrayMove(projects, from, to);
    setOptimistic(next);
    reorder.mutate(
      next.map((project, position) => ({ id: project._id, position })),
      {
        onSuccess: () => toast.success('Order saved'),
        onError: (error) => toast.error(errorMessage(error, 'Could not save the order')),
        onSettled: () => setOptimistic(null),
      },
    );
  };

  const onDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync(pendingDelete._id);
      toast.success(`Deleted “${pendingDelete.name}”`);
      setPendingDelete(null);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not delete'));
    }
  };

  const newButton = (
    <Button asChild>
      <Link href="/admin/projects/new">
        <Plus className="h-4 w-4" /> New project
      </Link>
    </Button>
  );

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Drag the handle to set the order on the public site. Featured projects always come first."
        action={newButton}
      />

      <div className="mt-8">
        <SectionHeaderEditor section="portfolio" />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        {isLoading ? (
          <ul className="divide-y divide-border">
            {Array.from({ length: 4 }, (_, row) => (
              <li key={row} className="flex items-center gap-3 p-3">
                <Skeleton className="h-8 w-8" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </li>
            ))}
          </ul>
        ) : projects.length === 0 ? (
          <EmptyState
            className="m-4 border-0"
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first project. Save it as a draft and publish when it's ready."
            action={newButton}
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
            accessibility={{
              container: typeof document === 'undefined' ? undefined : document.body,
            }}
          >
            <SortableContext
              items={projects.map((project) => project._id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="divide-y divide-border">
                {projects.map((project) => (
                  <SortableRow
                    key={project._id}
                    project={project}
                    onDelete={() => setPendingDelete(project)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete “${pendingDelete?.name ?? ''}”?`}
        description="This permanently removes the project and its text. Its images stay in your media library."
        confirmLabel="Delete project"
        destructive
        onConfirm={onDelete}
      />
    </div>
  );
}
