'use client';

import { Award, EyeOff } from 'lucide-react';
import { CollectionPage } from '@/components/admin/collection-page';
import { MediaThumb } from '@/components/admin/media-thumb';
import { Badge } from '@/components/ui/badge';
import { certificatesCollection } from '@/lib/admin/queries';

export default function AdminCertificatesPage() {
  return (
    <CollectionPage
      collection={certificatesCollection}
      title="Certificates"
      description="Shown under “Certifications” in the Experience section."
      basePath="/admin/certificates"
      newLabel="New certificate"
      itemLabel={(certificate) => certificate.title}
      empty={{
        icon: Award,
        title: 'No certificates yet',
        description: 'Add a certificate from a course, bootcamp or internship.',
      }}
      columns={[
        {
          header: 'Title',
          cell: (certificate) => (
            <div className="flex items-center gap-3">
              {certificate.imageUrl ? (
                <MediaThumb
                  kind="image"
                  url={certificate.imageUrl}
                  width={120}
                  className="h-10 w-14 overflow-hidden rounded-md"
                />
              ) : (
                <div className="flex h-10 w-14 items-center justify-center rounded-md bg-muted">
                  <Award className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <span className="font-medium">{certificate.title}</span>
            </div>
          ),
        },
        {
          header: 'Issuer',
          cell: (certificate) => certificate.issuer || '—',
          className: 'p-3 text-muted-foreground',
        },
        {
          header: 'Issued',
          cell: (certificate) => certificate.issuedAt || '—',
          className: 'p-3 text-muted-foreground',
        },
        {
          header: 'Status',
          cell: (certificate) =>
            certificate.isPublished ? (
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
