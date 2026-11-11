import { PageHeader } from '@/components/admin/page-header';
import { ProjectForm } from '@/components/admin/forms/project-form';

export default function NewProjectPage() {
  return (
    <div>
      <PageHeader
        back={{ href: '/admin/projects', label: 'Projects' }}
        title="New project"
        description="Only the name and slug are required — fill in the rest whenever you like."
      />
      <div className="mt-8">
        <ProjectForm />
      </div>
    </div>
  );
}
