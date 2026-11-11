'use client';

import { use } from 'react';
import { EditItem } from '@/components/admin/edit-item';
import { CertificateForm } from '@/components/admin/forms/certificate-form';
import { certificatesCollection } from '@/lib/admin/queries';

export default function EditCertificatePage({ params }: PageProps<'/admin/certificates/[id]'>) {
  const { id } = use(params);
  return (
    <EditItem
      query={certificatesCollection.useItem(id)}
      back={{ href: '/admin/certificates', label: 'Certificates' }}
      title={(certificate) => certificate.title}
    >
      {(certificate) => <CertificateForm certificate={certificate} />}
    </EditItem>
  );
}
