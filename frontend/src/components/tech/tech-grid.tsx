import type { CSSProperties } from 'react';
import { Reveal } from '@/components/motion/reveal';
import { techLogoSources } from './tech-logos';
import { TechIcon } from './tech-icon';

export interface TechGridItem {
  name: string;
  category?: string;
}

/** Drops case-insensitive duplicates (first one wins) and groups by category, in order. */
function groupByCategory(items: TechGridItem[]): [string, TechGridItem[]][] {
  const seen = new Set<string>();
  const groups = new Map<string, TechGridItem[]>();
  for (const item of items) {
    const id = item.name.toLowerCase().trim();
    if (seen.has(id)) continue;
    seen.add(id);
    const category = item.category?.trim() || 'Other';
    groups.set(category, [...(groups.get(category) ?? []), item]);
  }
  return [...groups];
}

export function TechGrid({ items }: { items: TechGridItem[] }) {
  const groups = groupByCategory(items);
  if (groups.length === 0) return null;

  return (
    <div className="space-y-8">
      {groups.map(([category, list]) => (
        <div key={category} className="space-y-4">
          <Reveal
            as="p"
            variant="focus"
            y={8}
            className="font-display text-[11.5px] font-semibold uppercase tracking-[0.24em] text-[hsl(220_22%_76%)]"
          >
            {category}
          </Reveal>
          <ul className="grid grid-cols-4 gap-x-2 gap-y-5 sm:grid-cols-5 sm:gap-x-3 sm:gap-y-6 md:grid-cols-6 lg:grid-cols-7">
            {list.map((item, index) => (
              <Reveal
                as="li"
                key={item.name}
                variant="pop"
                className="group flex cursor-default flex-col items-center gap-1.5 py-2"
              >
                {/* Each icon bobs on its own timing; pure CSS, compositor-only. */}
                <div
                  className="bob flex flex-col items-center gap-1.5"
                  style={
                    {
                      '--bob': `-${3 + (index % 3)}px`,
                      '--bob-duration': `${4 + (index % 5) * 0.6}s`,
                      '--bob-delay': `${(index % 7) * 0.35}s`,
                    } as CSSProperties
                  }
                >
                  {/* Halos never transform (browsers can drop a blur whose parent transforms). */}
                  <div className="relative isolate flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -m-6 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsl(var(--brand-indigo)/0.30),transparent_75%)] blur-2xl"
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -m-3 rounded-full bg-[radial-gradient(55%_55%_at_50%_50%,hsl(var(--brand-violet)/0.48),transparent_72%)] blur-xl"
                    />
                    <div
                      className="relative flex h-full w-full items-center justify-center transition-transform duration-300 ease-[var(--ease-premium)] group-hover:-translate-y-1 group-hover:scale-110"
                      style={{
                        filter:
                          'drop-shadow(0 4px 10px hsl(var(--brand-indigo) / 0.35)) drop-shadow(0 2px 4px hsl(220 40% 2% / 0.55))',
                      }}
                    >
                      <TechIcon name={item.name} sources={techLogoSources(item.name)} />
                    </div>
                  </div>
                  <p className="text-center text-[12px] font-bold tracking-tight text-[hsl(220_22%_88%)] transition-[transform,color] duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.04] group-hover:text-white">
                    {item.name}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
