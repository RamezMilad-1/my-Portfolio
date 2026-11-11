import { PageHeader } from '@/components/admin/page-header';
import { CertificateForm } from '@/components/admin/forms/certificate-form';

export default function NewCertificatePage() {
  return (
    <div>
      <PageHeader
        back={{ href: '/admin/certificates', label: 'Certificates' }}
        title="New certificate"
        description="It appears on the site as soon as it's published."
      />
      <div className="mt-8">
        <CertificateForm />
      </div>
    </div>
  );
}
