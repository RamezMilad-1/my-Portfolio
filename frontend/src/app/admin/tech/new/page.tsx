import { PageHeader } from '@/components/admin/page-header';
import { TechForm } from '@/components/admin/forms/tech-form';

export default function NewTechItemPage() {
  return (
    <div>
      <PageHeader
        back={{ href: '/admin/tech', label: 'Tech stack' }}
        title="New tech item"
        description="It appears in the Tech Stack tab as soon as it's published."
      />
      <div className="mt-8">
        <TechForm />
      </div>
    </div>
  );
}
