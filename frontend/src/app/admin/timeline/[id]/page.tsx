'use client';

import { use } from 'react';
import { EditItem } from '@/components/admin/edit-item';
import { TimelineForm } from '@/components/admin/forms/timeline-form';
import { timelineCollection } from '@/lib/admin/queries';

export default function EditTimelineEntryPage({ params }: PageProps<'/admin/timeline/[id]'>) {
  const { id } = use(params);
  return (
    <EditItem
      query={timelineCollection.useItem(id)}
      back={{ href: '/admin/timeline', label: 'Experience' }}
      title={(entry) => entry.topic || entry.year}
    >
      {(entry) => <TimelineForm entry={entry} />}
    </EditItem>
  );
}
