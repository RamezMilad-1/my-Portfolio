'use client';

import { use } from 'react';
import { EditItem } from '@/components/admin/edit-item';
import { ProjectForm } from '@/components/admin/forms/project-form';
import { useProject } from '@/lib/admin/queries';

export default function EditProjectPage({ params }: PageProps<'/admin/projects/[id]'>) {
  const { id } = use(params);
  return (
    <EditItem
      query={useProject(id)}
      back={{ href: '/admin/projects', label: 'Projects' }}
      title={(project) => project.name}
    >
      {(project) => <ProjectForm project={project} />}
    </EditItem>
  );
}
