import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CertificateForm } from '@/components/admin/certificate-form';

export default function NewCertificatePage() {
  return (
    <div>
      <Link
        href="/admin/certificates"
        className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Certificates
      </Link>
      <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight">
        New certificate
      </h1>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        Add a certificate. It will appear in the public Portfolio → Certificates
        tab as soon as it&apos;s published.
      </p>
      <div className="mt-8">
        <CertificateForm />
      </div>
    </div>
  );
}
