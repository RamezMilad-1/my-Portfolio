'use client';

import { Mail, MailOpen, Reply, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/admin/format';
import { useDeleteMessage, useMessages, useSetMessageRead } from '@/lib/admin/queries';
import { errorMessage } from '@/lib/api/client';
import type { ContactMessage } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function AdminMessagesPage() {
  const { data: messages, isLoading } = useMessages();
  const setRead = useSetMessageRead();
  const remove = useDeleteMessage();
  const [pendingDelete, setPendingDelete] = useState<ContactMessage | null>(null);

  const toggleRead = (message: ContactMessage) =>
    setRead.mutate(
      { id: message._id, read: !message.read },
      { onError: (error) => toast.error(errorMessage(error, 'Could not update the message')) },
    );

  const onDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync(pendingDelete._id);
      toast.success('Message deleted');
      setPendingDelete(null);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not delete'));
    }
  };

  return (
    <div>
      <PageHeader
        title="Messages"
        description="Submissions from the contact form on the public site."
      />

      <div className="mt-8 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))
        ) : (messages ?? []).length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No messages yet"
            description="New contact form submissions will appear here."
          />
        ) : (
          messages?.map((message) => (
            <article
              key={message._id}
              className={cn(
                'rounded-2xl border bg-card p-4',
                message.read ? 'border-border' : 'border-accent/40',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={cn('flex items-center gap-2', !message.read && 'font-semibold')}>
                    {!message.read ? (
                      <span className="h-2 w-2 rounded-full bg-accent" aria-label="Unread" />
                    ) : null}
                    {message.name}
                  </p>
                  <a
                    href={`mailto:${message.email}`}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {message.email}
                  </a>
                </div>
                <div className="flex items-center gap-1">
                  <time dateTime={message.createdAt} className="mr-2 text-xs text-muted-foreground">
                    {formatDateTime(message.createdAt)}
                  </time>
                  <Button asChild size="sm" variant="ghost">
                    <a href={`mailto:${message.email}`} aria-label={`Reply to ${message.name}`}>
                      <Reply className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleRead(message)}
                    aria-label={message.read ? 'Mark as unread' : 'Mark as read'}
                  >
                    {message.read ? (
                      <Mail className="h-3.5 w-3.5" />
                    ) : (
                      <MailOpen className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPendingDelete(message)}
                    aria-label={`Delete the message from ${message.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
                {message.body}
              </p>
            </article>
          ))
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete the message from ${pendingDelete?.name ?? ''}?`}
        description="This permanently removes the submission."
        confirmLabel="Delete message"
        destructive
        onConfirm={onDelete}
      />
    </div>
  );
}
