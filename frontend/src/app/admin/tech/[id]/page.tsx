'use client';

import { use } from 'react';
import { EditItem } from '@/components/admin/edit-item';
import { TechForm } from '@/components/admin/forms/tech-form';
import { techCollection } from '@/lib/admin/queries';

export default function EditTechItemPage({ params }: PageProps<'/admin/tech/[id]'>) {
  const { id } = use(params);
  return (
    <EditItem
      query={techCollection.useItem(id)}
      back={{ href: '/admin/tech', label: 'Tech stack' }}
      title={(item) => item.name}
    >
      {(item) => <TechForm item={item} />}
    </EditItem>
  );
}
