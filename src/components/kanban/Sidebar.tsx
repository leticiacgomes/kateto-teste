import { cn } from "@/lib/cn";

const BOARD_ICON = "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z";

export function Sidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-surface-overlay backdrop-blur-[2px] md:hidden"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[220px] shrink-0 flex-col border-r border-line-subtle bg-surface-app-deep px-3.5 py-4.5",
          "transition-transform duration-[180ms] ease-standard md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <a
          href="/"
          className="block rounded-sm px-2.5 pt-1 pb-5 font-display text-h4 font-bold tracking-heading text-fg-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          dropbase<span className="text-brand">.</span>{" "}
          <span className="align-middle font-mono text-micro tracking-label text-fg-faint">
            OPS
          </span>
        </a>
        <nav className="flex flex-col gap-0.5">
          <span
            aria-current="page"
            className="flex items-center gap-3 rounded-md bg-surface-2 px-2.5 py-2.5 font-ui text-body text-fg-strong shadow-[inset_2px_0_0_var(--color-magenta-500)]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>Leads</title>
              <path d={BOARD_ICON} />
            </svg>
            Leads
          </span>
        </nav>
      </aside>
    </>
  );
}
