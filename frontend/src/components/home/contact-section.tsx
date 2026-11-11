import { Github, Linkedin, Mail, Send, Twitter } from 'lucide-react';
import type { ReactNode } from 'react';
import { Reveal } from '@/components/motion/reveal';
import { DISTANCE, STAGGER, staggerDelay } from '@/components/motion/tokens';
import { GradientButton } from '@/components/ui/gradient-button';
import { SectionHeading } from '@/components/ui/section-heading';
import type { Profile } from '@/lib/types';
import { displayUrl } from '@/lib/utils';
import { ContactForm } from './contact-form';
import { CopyButton } from './copy-button';

interface ContactCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  href: string;
  external?: boolean;
  action?: ReactNode;
  note?: string;
}

function ContactCard({ icon, label, value, href, external, action, note }: ContactCardProps) {
  return (
    <div className="group glass-card card-sheen ring-conic glow-hover relative flex items-center gap-3 overflow-hidden rounded-xl p-3 transition-transform duration-300 hover:-translate-y-1">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-brand-violet/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="icon-tile relative h-9 w-9 flex-shrink-0 [&_svg]:h-4 [&_svg]:w-4">{icon}</div>
      <div className="relative min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[hsl(220_15%_68%)]">
          {label}
        </p>
        <span aria-hidden className="accent-underline mt-1" />
        <a
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          className="mt-1 block truncate text-sm font-medium text-[hsl(220_25%_94%)] transition-colors duration-300 hover:text-white"
        >
          {value}
        </a>
        {note ? <p className="mt-1 text-xs font-medium text-muted-foreground">{note}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function ContactSection({ profile }: { profile: Profile }) {
  const { github, linkedin, x } = profile.socials;
  const cards: (ContactCardProps & { key: string })[] = [];
  if (profile.email) {
    cards.push({
      key: 'email',
      icon: <Mail className="h-5 w-5" />,
      label: 'Email',
      value: profile.email,
      href: `mailto:${profile.email}`,
      action: <CopyButton value={profile.email} />,
      note: profile.responseTime.trim() || undefined,
    });
  }
  if (github) {
    cards.push({
      key: 'github',
      icon: <Github className="h-5 w-5" />,
      label: 'GitHub',
      value: displayUrl(github),
      href: github,
      external: true,
    });
  }
  if (linkedin) {
    cards.push({
      key: 'linkedin',
      icon: <Linkedin className="h-5 w-5" />,
      label: 'LinkedIn',
      value: displayUrl(linkedin),
      href: linkedin,
      external: true,
    });
  }
  if (x) {
    cards.push({
      key: 'x',
      icon: <Twitter className="h-5 w-5" />,
      label: 'X / Twitter',
      value: displayUrl(x),
      href: x,
      external: true,
    });
  }
  // Cards alternate a slight vertical drift as they slide in.
  const drift = [DISTANCE.sm, 0, -DISTANCE.sm, 0];

  return (
    <section id="contact" className="relative scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker={profile.contactKicker}
          title={profile.contactTitle}
          subtitle={profile.contactSubtitle}
        />

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1fr)]">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-1">
            {cards.map(({ key, ...card }, index) => (
              <Reveal
                key={key}
                x={-DISTANCE.lg}
                y={drift[index % drift.length]}
                delay={staggerDelay(index, STAGGER.loose)}
              >
                <ContactCard {...card} />
              </Reveal>
            ))}
          </div>
          <Reveal x={DISTANCE.lg} y={0} delay={STAGGER.loose}>
            <ContactForm />
          </Reveal>
        </div>

        {profile.email && profile.contactCTALabel.trim() ? (
          <div className="mt-10 flex justify-center">
            <GradientButton asChild>
              <a href={`mailto:${profile.email}`}>
                <Send className="h-4 w-4" />
                {profile.contactCTALabel.trim()}
              </a>
            </GradientButton>
          </div>
        ) : null}
      </div>
    </section>
  );
}
