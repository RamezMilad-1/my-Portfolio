'use client';

import { Code2, EyeOff } from 'lucide-react';
import { CollectionPage } from '@/components/admin/collection-page';
import { Badge } from '@/components/ui/badge';
import { techCollection } from '@/lib/admin/queries';

export default function AdminTechPage() {
  return (
    <CollectionPage
      collection={techCollection}
      title="Tech stack"
      description="The Tech Stack tab of the Portfolio section. While this list is empty, the site shows every tech used across your projects."
      basePath="/admin/tech"
      newLabel="New tech item"
      itemLabel={(item) => item.name}
      empty={{
        icon: Code2,
        title: 'No tech items yet',
        description:
          'Add entries to choose exactly what the Tech Stack tab shows, and in which order.',
      }}
      columns={[
        { header: 'Name', cell: (item) => item.name, className: 'p-3 font-medium' },
        {
          header: 'Category',
          cell: (item) => item.category || '—',
          className: 'p-3 text-muted-foreground',
        },
        {
          header: 'Position',
          cell: (item) => item.position,
          className: 'p-3 text-muted-foreground',
        },
        {
          header: 'Status',
          cell: (item) =>
            item.isPublished ? (
              <Badge variant="default">Published</Badge>
            ) : (
              <Badge>
                <EyeOff className="mr-1 h-3 w-3" /> Hidden
              </Badge>
            ),
        },
      ]}
    />
  );
}
