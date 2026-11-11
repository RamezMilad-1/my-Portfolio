import { Github, Linkedin } from 'lucide-react';
import type { TeamMember } from '@/lib/types';

const iconLink =
  'rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';

export function TeamGrid({ members }: { members: TeamMember[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <li
          key={member._id}
          className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-accent/40"
        >
          <p className="truncate text-sm font-medium">{member.name}</p>
          <div className="flex items-center gap-2">
            {member.githubUrl ? (
              <a
                href={member.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} on GitHub`}
                className={iconLink}
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
                className={iconLink}
              >
                <Linkedin className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
