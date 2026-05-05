'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ExternalLink, Github, Star } from 'lucide-react';
import { useProjectsAll, useDeleteProject } from '@/lib/api/projects';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminProjectsPage() {
  const { data, isLoading } = useProjectsAll();
  const del = useDeleteProject();

  const onDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await del.mutateAsync(id);
      toast.success('Project deleted');
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
              <th className="p-3">Name</th>
              <th className="p-3">Status</th>
              <th className="p-3">Tech</th>
              <th className="p-3">Links</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-[hsl(var(--muted-foreground))]">
                  Loading…
                </td>
              </tr>
            ) : (data ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-[hsl(var(--muted-foreground))]">
                  No projects yet. Run <code>npm run db:seed</code> in the backend or create one.
                </td>
              </tr>
            ) : (
              (data ?? []).map((p) => (
                <tr key={p._id}>
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
                        <Badge variant="outline" className="text-[10px]">
                          +{p.tech.length - 4}
                        </Badge>
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
                        onClick={() => onDelete(p._id, p.name)}
                        aria-label="Delete project"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
