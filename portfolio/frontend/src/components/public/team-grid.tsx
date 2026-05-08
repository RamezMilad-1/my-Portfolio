'use client';

import { Github, Linkedin } from 'lucide-react';
import type { ProjectTeamLink, TeamMember } from '@/lib/types';

export function TeamGrid({ team }: { team: ProjectTeamLink[] }) {
  const resolved = team
    .map((t) => (typeof t.memberId === 'string' ? null : (t.memberId as TeamMember)))
    .filter(Boolean) as TeamMember[];

  if (resolved.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {resolved.map((member) => (
        <div
          key={member._id}
          className="flex items-center justify-between gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 transition-colors hover:border-[hsl(var(--accent))]/40"
        >
          <p className="truncate text-sm font-medium">{member.name}</p>
          <div className="flex items-center gap-2">
            {member.githubUrl ? (
              <a
                href={member.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} on GitHub`}
                className="rounded-md p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
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
                className="rounded-md p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
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
