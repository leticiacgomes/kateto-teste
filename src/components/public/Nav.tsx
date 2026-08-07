import { ButtonLink } from "@/components/ui/forms/ButtonLink";

export function Nav() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line-subtle bg-surface-app/72 px-5 backdrop-blur-[14px] sm:px-10">
      <div className="flex items-center gap-10">
        <div className="font-display text-h4 font-bold tracking-heading text-fg-strong">
          dropbase
          <span className="text-brand [text-shadow:0_0_12px_var(--color-magenta-glow)]">
            .
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3.5">
        <ButtonLink
          href="/dashboard"
          variant="secondary"
          size="sm"
          aria-label="Dashboard"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
        </ButtonLink>
        <ButtonLink href="#contact" size="sm">
          Monte sua coleção
        </ButtonLink>
      </div>
    </header>
  );
}
