'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Github,
  Star,
  GripVertical,
  FolderKanban,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
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
  useProjectsAll,
  useDeleteProject,
  useReorderProjects,
} from '@/lib/api/projects';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { Project } from '@/lib/types';

export default function AdminProjectsPage() {
  const { data, isLoading } = useProjectsAll();
  const del = useDeleteProject();
  const reorder = useReorderProjects();

  // Mirror the server data into local state so we can show optimistic
  // updates while the reorder request is in flight.
  const [items, setItems] = useState<Project[]>([]);
  useEffect(() => {
    if (data) {
      setItems(
        data.slice().sort((a, b) => a.position - b.position),
      );
    }
  }, [data]);

  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((p) => p._id === active.id);
    const newIndex = items.findIndex((p) => p._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);

    reorder.mutate(
      next.map((p, i) => ({ id: p._id, position: i })),
      {
        onSuccess: () => toast.success('Order saved'),
        onError: () => {
          toast.error('Could not save order');
          // revert
          setItems(items);
        },
      },
    );
  };

  const onDelete = async () => {
    if (!pendingDelete) return;
    try {
      await del.mutateAsync(pendingDelete._id);
      toast.success('Project deleted');
      setPendingDelete(null);
    } catch {
      toast.error('Could not delete');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Admin</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Drag the handle to reorder how projects appear publicly.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/projects/new">
            <Plus className="h-4 w-4" /> New project
          </Link>
        </Button>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-[hsl(var(--border))]">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--muted))]/50 text-left">
            <tr>
              <th className="w-10 p-3" aria-label="Reorder" />
              <th className="p-3">Name</th>
              <th className="p-3">Status</th>
              <th className="p-3">Tech</th>
              <th className="p-3">Links</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td className="p-3"><Skeleton className="h-4 w-4" /></td>
                  <td className="p-3"><Skeleton className="h-5 w-40" /><Skeleton className="mt-1 h-3 w-20" /></td>
                  <td className="p-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="p-3"><Skeleton className="h-5 w-32" /></td>
                  <td className="p-3"><Skeleton className="h-5 w-12" /></td>
                  <td className="p-3 text-right"><Skeleton className="ml-auto h-7 w-16" /></td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-0">
                  <EmptyState
                    className="m-4 border-0 border-dashed-0"
                    icon={FolderKanban}
                    title="No projects yet"
                    description="Create your first project to populate the public site. You can save it as a draft and publish later."
                    action={
                      <Button asChild>
                        <Link href="/admin/projects/new">
                          <Plus className="h-4 w-4" /> New project
                        </Link>
                      </Button>
                    }
                  />
                </td>
              </tr>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={items.map((p) => p._id)} strategy={verticalListSortingStrategy}>
                  {items.map((p) => (
                    <SortableRow
                      key={p._id}
                      project={p}
                      onDelete={() => setPendingDelete(p)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ''}"?`}
        description="This permanently removes the project, its case-study text, tech tags, and team links. Uploaded media in your library is not affected."
        confirmLabel="Delete project"
        destructive
        onConfirm={onDelete}
      />
    </div>
  );
}

function SortableRow({
  project: p,
  onDelete,
}: {
  project: Project;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: p._id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    background: isDragging ? 'hsl(var(--muted))' : undefined,
  };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-[hsl(var(--muted))]/40">
      <td className="p-3">
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="flex h-8 w-8 cursor-grab items-center justify-center rounded-md text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          {p.isFeatured ? <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> : null}
          <span className="font-medium">{p.name}</span>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">/{p.slug}</p>
      </td>
      <td className="p-3">
        <Badge variant={p.status === 'published' ? 'default' : 'outline'}>{p.status}</Badge>
      </td>
      <td className="p-3">
        <div className="flex flex-wrap gap-1">
          {p.tech.slice(0, 4).map((t) => (
            <Badge key={t} variant="outline" className="text-[10px]">
              {t}
            </Badge>
          ))}
          {p.tech.length > 4 ? (
            <Badge variant="outline" className="text-[10px]">+{p.tech.length - 4}</Badge>
          ) : null}
        </div>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
          {p.githubUrl ? (
            <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <Github className="h-3.5 w-3.5" />
            </a>
          ) : null}
          {p.liveUrl ? (
            <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" aria-label="Live URL">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </td>
      <td className="p-3 text-right">
        <div className="inline-flex gap-1">
          <Button asChild size="sm" variant="ghost">
            <Link href={`/admin/projects/${p._id}`}>
              <Pencil className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            aria-label="Delete project"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-500" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
