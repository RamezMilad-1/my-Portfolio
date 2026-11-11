'use client';

import { FolderKanban, Image as ImageIcon, Mail, Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMediaLibrary, useMessages, useProjects, useTeam } from '@/lib/admin/queries';

export default function AdminDashboardPage() {
  const { data: projects } = useProjects();
  const { data: media } = useMediaLibrary();
  const { data: team } = useTeam();
  const { data: messages } = useMessages();

  const stats = [
    {
      label: 'Projects',
      value: projects?.length,
      detail: `${projects?.filter((project) => project.status === 'published').length ?? 0} published`,
      href: '/admin/projects',
      icon: FolderKanban,
    },
    {
      label: 'Messages',
      value: messages?.length,
      detail: `${messages?.filter((message) => !message.read).length ?? 0} unread`,
      href: '/admin/messages',
      icon: Mail,
    },
    {
      label: 'Media',
      value: media?.length,
      detail: `${media?.filter((item) => item.kind === 'image').length ?? 0} images`,
      href: '/admin/media',
      icon: ImageIcon,
    },
    {
      label: 'Team',
      value: team?.length,
      detail: 'reusable across projects',
      href: '/admin/team',
      icon: Users,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        action={
          <Button asChild>
            <Link href="/admin/projects/new">
              <Plus className="h-4 w-4" /> New project
            </Link>
          </Button>
        }
      />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, detail, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="transition-colors hover:border-accent/50">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="font-display text-3xl font-semibold">{value ?? '—'}</p>
                <p className="text-xs text-muted-foreground">{detail}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold">Quick links</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          ['/admin/projects', 'Edit projects'],
          ['/admin/profile', 'Edit your profile'],
          ['/admin/media', 'Upload media'],
          ['/admin/team', 'Manage the team roster'],
        ].map(([href, label]) => (
          <Button key={href} asChild variant="outline" className="justify-start">
            <Link href={href}>{label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
