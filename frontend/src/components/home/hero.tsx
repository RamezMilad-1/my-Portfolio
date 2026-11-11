import { ArrowRight, FileDown } from 'lucide-react';
import { SocialLinks } from '@/components/layout/social-links';
import { entranceSequence } from '@/components/motion/entrance';
import { GradientButton } from '@/components/ui/gradient-button';
import { StatusBadge } from '@/components/ui/status-badge';
import type { Profile } from '@/lib/types';
import { heroIconImages } from './hero-icons';
import { IconCloud } from './icon-cloud';

export function Hero({ profile }: { profile: Profile }) {
  const availability = profile.availability.trim();
  const displayName = profile.displayName.trim();
  const role = profile.headlines.map((line) => line.trim()).find(Boolean) ?? '';
  const subtitle = profile.headline.trim();
  // The page's one orchestrated moment: badge, name and title come into focus, the actions
  // follow in a wave, and the icon cloud zooms in last.
  const delay = entranceSequence();

  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative flex min-h-screen items-center pt-24 sm:pt-28"
    >
      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-20">
        <div className="relative z-10 max-w-[38rem]">
          {availability ? (
            <div className="enter-slide" style={delay()}>
              <StatusBadge
                label={availability}
                tone="emerald"
                className="px-3 py-1 text-[11px]"
                borderGradient="linear-gradient(90deg, hsl(246 46% 58% / 0.72), hsl(272 38% 62% / 0.58))"
                haloClassName="opacity-25 blur-sm"
                pingClassName="bg-[hsl(152_55%_54%)] opacity-35"
                dotClassName="bg-[hsl(152_55%_54%)] opacity-90"
                labelClassName="font-medium text-[hsl(220_24%_88%)]"
                iconClassName="h-3 w-3 text-[hsl(260_26%_72%)] opacity-65"
              />
            </div>
          ) : null}

          {displayName ? (
            <p
              className="enter-focus mt-4 text-[11px] font-medium uppercase tracking-[0.36em] text-[hsl(260_24%_74%/0.82)] md:text-xs"
              style={delay()}
            >
              {displayName}
            </p>
          ) : null}

          {role ? (
            <h1
              className="enter-sharpen mt-2 font-sans text-[clamp(2rem,4.6vw,3rem)] font-semibold leading-[1.03] tracking-[0]"
              style={delay({
                '--reveal-y': '24px',
                '--reveal-blur': '14px',
                '--enter-duration': '1.2s',
              })}
            >
              <span className="hero-title block whitespace-nowrap">{role}</span>
            </h1>
          ) : null}

          {subtitle ? (
            <p
              className="enter-sharpen mt-4 max-w-[36rem] text-[15px] leading-[1.75] text-[hsl(220_18%_76%)] md:text-[16px]"
              style={delay()}
            >
              {subtitle}
            </p>
          ) : null}

          <div
            className="enter-stagger mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3"
            style={delay({ '--reveal-y': '16px' })}
          >
            <GradientButton asChild className="hero-cta font-medium">
              <a href="#portfolio">
                Projects <ArrowRight className="h-4 w-4" />
              </a>
            </GradientButton>
            {profile.resumeUrl ? (
              <GradientButton asChild variant="outline" className="hero-cta font-medium">
                <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                  <FileDown className="h-4 w-4" /> Download CV
                </a>
              </GradientButton>
            ) : null}
          </div>

          {/* The delay and animation name are inherited by the links inside. */}
          <div className="mt-6" style={delay({ '--stagger-name': 'reveal-pop' })}>
            <SocialLinks
              profile={profile}
              className="enter-stagger flex items-center gap-2.5"
              linkClassName="hero-social-link glass-card flex h-9 w-9 items-center justify-center rounded-full text-[hsl(220_18%_72%)] transition-[transform,color,border-color,box-shadow] duration-300 ease-[var(--ease-premium)] hover:-translate-y-0.5 hover:text-[hsl(230_26%_92%)]"
            />
          </div>
        </div>

        <div
          className="enter-zoom relative flex size-full items-center justify-center overflow-visible md:justify-end md:pr-2 lg:pr-6"
          style={delay()}
        >
          <IconCloud images={heroIconImages} />
        </div>
      </div>
    </section>
  );
}
