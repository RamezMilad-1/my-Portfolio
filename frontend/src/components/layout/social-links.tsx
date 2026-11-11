import { Github, Globe, Linkedin, type LucideIcon, Mail, Twitter } from 'lucide-react';
import type { Profile } from '@/lib/types';

type LinkKey = 'github' | 'linkedin' | 'x' | 'website' | 'email';

const LINKS: Record<LinkKey, { label: string; icon: LucideIcon }> = {
  github: { label: 'GitHub', icon: Github },
  linkedin: { label: 'LinkedIn', icon: Linkedin },
  x: { label: 'X / Twitter', icon: Twitter },
  website: { label: 'Website', icon: Globe },
  email: { label: 'Email', icon: Mail },
};

export interface ProfileLink {
  key: LinkKey;
  label: string;
  href: string;
  icon: LucideIcon;
  external: boolean;
}

/** The profile's social links plus email, in display order, skipping empty ones. */
export function profileLinks(profile: Pick<Profile, 'socials' | 'email'>): ProfileLink[] {
  const links: ProfileLink[] = [];
  for (const key of ['github', 'linkedin', 'x', 'website'] as const) {
    const href = profile.socials[key];
    if (href) links.push({ key, href, external: true, ...LINKS[key] });
  }
  if (profile.email) {
    links.push({ key: 'email', href: `mailto:${profile.email}`, external: false, ...LINKS.email });
  }
  return links;
}

interface SocialLinksProps {
  profile: Pick<Profile, 'socials' | 'email'>;
  className?: string;
  linkClassName?: string;
  iconClassName?: string;
}

export function SocialLinks({
  profile,
  className,
  linkClassName,
  iconClassName = 'h-4 w-4',
}: SocialLinksProps) {
  const links = profileLinks(profile);
  if (links.length === 0) return null;
  return (
    <div className={className}>
      {links.map(({ key, label, href, icon: Icon, external }) => (
        <a
          key={key}
          href={href}
          aria-label={label}
          title={label}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          className={linkClassName}
        >
          <Icon aria-hidden className={iconClassName} />
        </a>
      ))}
    </div>
  );
}
