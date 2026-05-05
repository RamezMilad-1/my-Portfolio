'use client';

import { Github, Linkedin } from 'lucide-react';
import { uploadsUrl } from '@/lib/utils';
import type { ProjectTeamLink, TeamMember } from '@/lib/types';

export function TeamGrid({ team }: { team: ProjectTeamLink[] }) {
  const resolved = team
    .map((t) => {
      if (typeof t.memberId === 'string') return null;
      return { member: t.memberId as TeamMember, roleInProject: t.roleInProject };
    })
    .filter(Boolean) as { member: TeamMember; roleInProject: string }[];

  if (resolved.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resolved.map(({ member, roleInProject }) => (
        <div
          key={member._id}
          className="flex items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
        >
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
            {member.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={uploadsUrl(member.avatarUrl)}
                alt={member.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold">
                {member.name
                  .split(' ')
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{member.name}</p>
            <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
              {roleInProject || member.role}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {member.githubUrl ? (
              <a
                href={member.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} on GitHub`}
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                <Github className="h-4 w-4" />
              </a>
            ) : null}
            {member.linkedinUrl ? (
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} on LinkedIn`}
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
