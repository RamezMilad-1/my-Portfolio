'use client';

import { EyeOff, GitBranch } from 'lucide-react';
import { CollectionPage } from '@/components/admin/collection-page';
import { SectionHeaderEditor } from '@/components/admin/section-header-editor';
import { Badge } from '@/components/ui/badge';
import { timelineCollection } from '@/lib/admin/queries';

export default function AdminTimelinePage() {
  return (
    <CollectionPage
      collection={timelineCollection}
      title="Experience"
      description="The timeline in the Experience section, oldest to newest — the last entry is marked “Latest”."
      basePath="/admin/timeline"
      newLabel="New entry"
      itemLabel={(entry) => entry.topic || entry.year}
      empty={{
        icon: GitBranch,
        title: 'No timeline entries yet',
        description: 'Add milestones from your journey; each becomes a stop on the timeline.',
      }}
      columns={[
        { header: 'When', cell: (entry) => entry.year, className: 'p-3 font-medium' },
        {
          header: 'Topic',
          cell: (entry) => entry.topic || '—',
          className: 'p-3 text-muted-foreground',
        },
        {
          header: 'Description',
          cell: (entry) => entry.body,
          className: 'max-w-md truncate p-3 text-muted-foreground',
        },
        {
          header: 'Status',
          cell: (entry) =>
            entry.isPublished ? (
              <Badge variant="default">Published</Badge>
            ) : (
              <Badge>
                <EyeOff className="mr-1 h-3 w-3" /> Hidden
              </Badge>
            ),
        },
      ]}
    >
      <SectionHeaderEditor section="lifeline" />
    </CollectionPage>
  );
}
