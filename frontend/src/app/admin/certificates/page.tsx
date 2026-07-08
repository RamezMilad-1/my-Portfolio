'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Award,
  EyeOff,
} from 'lucide-react';
import {
  useCertificatesAll,
  useDeleteCertificate,
} from '@/lib/api/certificates';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { Certificate } from '@/lib/types';

export default function AdminCertificatesPage() {
  const { data, isLoading } = useCertificatesAll();
  const del = useDeleteCertificate();
  const [pendingDelete, setPendingDelete] = useState<Certificate | null>(null);

  const onDelete = async () => {
    if (!pendingDelete) return;
    try {
      await del.mutateAsync(pendingDelete._id);
      toast.success('Certificate deleted');
      setPendingDelete(null);
    } catch {
      toast.error('Could not delete');
    }
  };

  const items = (data ?? []).slice().sort((a, b) => a.position - b.position);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Admin</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Certificates
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Manage what shows up under the Portfolio → Certificates tab.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/certificates/new">
            <Plus className="h-4 w-4" /> New certificate
          </Link>
        </Button>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-[hsl(var(--border))]">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--muted))]/50 text-left">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Issuer</th>
              <th className="p-3">Issued</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td className="p-3">
                    <Skeleton className="h-5 w-40" />
                  </td>
                  <td className="p-3">
                    <Skeleton className="h-5 w-32" />
                  </td>
                  <td className="p-3">
                    <Skeleton className="h-5 w-24" />
                  </td>
                  <td className="p-3">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </td>
                  <td className="p-3 text-right">
                    <Skeleton className="ml-auto h-7 w-16" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-0">
                  <EmptyState
                    className="m-4 border-0 border-dashed-0"
                    icon={Award}
                    title="No certificates yet"
                    description="Add a certificate from a course, bootcamp, or workshop. Recruiters love seeing these."
                    action={
                      <Button asChild>
                        <Link href="/admin/certificates/new">
                          <Plus className="h-4 w-4" /> New certificate
                        </Link>
                      </Button>
                    }
                  />
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr
                  key={c._id}
                  className="hover:bg-[hsl(var(--muted))]/40"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {c.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.imageUrl}
                          alt=""
                          className="h-10 w-14 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-14 items-center justify-center rounded-md bg-[hsl(var(--muted))]">
                          <Award className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        </div>
                      )}
                      <span className="font-medium">{c.title}</span>
                    </div>
                  </td>
                  <td className="p-3 text-[hsl(var(--muted-foreground))]">
                    {c.issuer || '—'}
                  </td>
                  <td className="p-3 text-[hsl(var(--muted-foreground))]">
                    {c.issuedAt || '—'}
                  </td>
                  <td className="p-3">
                    {c.isPublished ? (
                      <Badge>Published</Badge>
                    ) : (
                      <Badge variant="outline">
                        <EyeOff className="mr-1 h-3 w-3" /> Hidden
                      </Badge>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-1">
                      {c.credentialUrl ? (
                        <Button asChild size="sm" variant="ghost">
                          <a
                            href={c.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open credential"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      ) : null}
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/admin/certificates/${c._id}`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPendingDelete(c)}
                        aria-label="Delete"
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

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.title ?? ''}"?`}
        description="This permanently removes the certificate entry. Uploaded media in your library is not affected."
        confirmLabel="Delete certificate"
        destructive
        onConfirm={onDelete}
      />
    </div>
  );
}
