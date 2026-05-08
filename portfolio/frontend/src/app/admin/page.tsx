'use client';

import Link from 'next/link';
import { useProjectsAll } from '@/lib/api/projects';
import { useMediaList } from '@/lib/api/media';
import { useTeam } from '@/lib/api/team';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FolderKanban, Image as ImageIcon, Users } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: projects } = useProjectsAll();
  const { data: media } = useMediaList();
  const { data: team } = useTeam();

  const stats = [
    {
      label: 'Projects',
      value: projects?.length ?? '—',
      sub: `${projects?.filter((p) => p.status === 'published').length ?? 0} published`,
      href: '/admin/projects',
      icon: FolderKanban,
    },
    {
      label: 'Media',
      value: media?.length ?? '—',
      sub: `${media?.filter((m) => m.kind === 'image').length ?? 0} images`,
      href: '/admin/media',
      icon: ImageIcon,
    },
    {
      label: 'Team',
      value: team?.length ?? '—',
      sub: 'reusable across projects',
      href: '/admin/team',
      icon: Users,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Admin</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <Button asChild>
          <Link href="/admin/projects/new">
            <Plus className="h-4 w-4" /> New project
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}>
              <Card className="transition-colors hover:border-[hsl(var(--accent))]/50">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                    {s.label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                </CardHeader>
                <CardContent>
                  <p className="font-display text-3xl font-semibold">{s.value}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{s.sub}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-semibold">Quick links</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button asChild variant="outline" className="justify-start">
            <Link href="/admin/projects">Edit projects</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/admin/profile">Edit personal profile</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/admin/media">Upload media</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/admin/team">Manage team roster</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
