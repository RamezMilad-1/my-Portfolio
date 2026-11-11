import { PageHeader } from '@/components/admin/page-header';
import { TimelineForm } from '@/components/admin/forms/timeline-form';

export default function NewTimelineEntryPage() {
  return (
    <div>
      <PageHeader
        back={{ href: '/admin/timeline', label: 'Experience' }}
        title="New entry"
        description="It appears on the timeline as soon as it's published."
      />
      <div className="mt-8">
        <TimelineForm />
      </div>
    </div>
  );
}
