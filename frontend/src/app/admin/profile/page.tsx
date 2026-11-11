'use client';

import { PageHeader } from '@/components/admin/page-header';
import { ProfileForm } from '@/components/admin/forms/profile-form';
import { SectionHeaderEditor } from '@/components/admin/section-header-editor';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile } from '@/lib/admin/queries';

export default function AdminProfilePage() {
  const { data: profile, isLoading } = useProfile();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Profile"
        description="Everything personal on the site. Fields left empty are simply not shown."
      />

      {isLoading || !profile ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : (
        <ProfileForm profile={profile} />
      )}

      {/* Separate forms: each heading saves on its own, without touching the profile form. */}
      <SectionHeaderEditor section="about" />
      <SectionHeaderEditor section="contact" />
    </div>
  );
}
