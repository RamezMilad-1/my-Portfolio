export type FocusBlock = {
  heading?: string;
  body?: string;
};

function FocusItem({ block }: { block: FocusBlock }) {
  const body = block.body?.trim();
  const heading = block.heading?.trim();

  return (
    <li className="group ek-glass relative flex items-start gap-3 overflow-hidden rounded-xl px-3.5 py-2.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5">
      <span
        aria-hidden
        className="mt-[3px] inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-violet))] shadow-[0_0_0_3px_hsl(var(--brand-violet)/0.18)]"
      />
      <div className="min-w-0">
        {heading ? (
          <p className="text-[13px] font-semibold leading-relaxed text-[hsl(220_22%_94%)] transition-colors duration-300 group-hover:text-white">
            {heading}
          </p>
        ) : null}
        {body ? (
          <p
            className={`text-[13px] leading-relaxed text-[hsl(220_22%_88%)] transition-colors duration-300 group-hover:text-white ${
              heading ? 'mt-1' : ''
            }`}
          >
            {body}
          </p>
        ) : null}
      </div>
    </li>
  );
}

export function FocusSection({
  kicker,
  title,
  subtitle,
  blocks,
}: {
  kicker?: string;
  title?: string;
  subtitle?: string;
  blocks: FocusBlock[];
}) {
  const visibleBlocks = blocks.filter((block) => block.heading?.trim() || block.body?.trim());
  if (visibleBlocks.length === 0) return null;

  return (
    <div className="mt-10">
      <p className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(220_15%_68%)]">
        {kicker || 'What I can ship'}
      </p>
      <span
        aria-hidden
        className="mt-2.5 block h-px w-12 bg-gradient-to-r from-[hsl(var(--brand-violet-soft)/0.7)] via-[hsl(var(--brand-violet-soft)/0.35)] to-transparent"
      />

      {title ? (
        <h3 className="mt-4 text-[15px] font-semibold text-[hsl(var(--foreground))]">
          {title}
        </h3>
      ) : null}

      {subtitle ? (
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{subtitle}</p>
      ) : null}

      <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {visibleBlocks.map((block, index) => (
          <FocusItem key={`${block.heading ?? ''}-${block.body ?? ''}-${index}`} block={block} />
        ))}
      </ul>
    </div>
  );
}
