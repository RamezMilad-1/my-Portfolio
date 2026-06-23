'use client';

import { useState } from 'react';
import { Mail, Reply, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDeleteMessage, useMessages } from '@/lib/api/messages';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { ContactMessage } from '@/lib/types';

function formatDate(value?: string) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function AdminMessagesPage() {
  const { data, isLoading } = useMessages();
  const del = useDeleteMessage();
  const [pendingDelete, setPendingDelete] = useState<ContactMessage | null>(null);

  const onDelete = async () => {
    if (!pendingDelete) return;
    try {
      await del.mutateAsync(pendingDelete._id);
      toast.success('Message deleted');
      setPendingDelete(null);
    } catch {
      toast.error('Could not delete');
    }
  };

  const messages = data ?? [];

  return (
    <div>
      <div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Admin</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Messages
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Contact form submissions from the public site.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-[hsl(var(--border))]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-[hsl(var(--muted))]/50 text-left">
              <tr>
                <th className="p-3">From</th>
                <th className="p-3">Message</th>
                <th className="p-3">Received</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-3">
                      <Skeleton className="h-5 w-36" />
                      <Skeleton className="mt-2 h-4 w-48" />
                    </td>
                    <td className="p-3">
                      <Skeleton className="h-5 w-72" />
                    </td>
                    <td className="p-3">
                      <Skeleton className="h-5 w-32" />
                    </td>
                    <td className="p-3 text-right">
                      <Skeleton className="ml-auto h-8 w-20" />
                    </td>
                  </tr>
                ))
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-0">
                    <EmptyState
                      className="m-4 border-0 border-dashed-0"
                      icon={Mail}
                      title="No messages yet"
                      description="New contact form submissions will appear here."
                    />
                  </td>
                </tr>
              ) : (
                messages.map((message) => (
                  <tr
                    key={message._id}
                    className="align-top hover:bg-[hsl(var(--muted))]/40"
                  >
                    <td className="p-3">
                      <p className="font-medium">{message.name}</p>
                      <a
                        href={`mailto:${message.email}`}
                        className="mt-1 block text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                      >
                        {message.email}
                      </a>
                    </td>
                    <td className="max-w-xl p-3 text-[hsl(var(--muted-foreground))]">
                      <p className="line-clamp-3 whitespace-pre-line">
                        {message.body}
                      </p>
                    </td>
                    <td className="p-3 text-[hsl(var(--muted-foreground))]">
                      {formatDate(message.createdAt)}
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex gap-1">
                        <Button asChild size="sm" variant="ghost">
                          <a href={`mailto:${message.email}`}>
                            <Reply className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPendingDelete(message)}
                          aria-label="Delete message"
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

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete message from ${pendingDelete?.name ?? ''}?`}
        description="This permanently removes the contact form submission."
        confirmLabel="Delete message"
        destructive
        onConfirm={onDelete}
      />
    </div>
  );
}
