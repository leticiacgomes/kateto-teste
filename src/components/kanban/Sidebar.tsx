const BOARD_ICON = "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z";

export function Sidebar() {
  return (
    <aside className="flex w-[220px] shrink-0 flex-col border-r border-line-subtle bg-surface-app-deep px-3.5 py-4.5">
      <div className="px-2.5 pt-1 pb-5 font-display text-[20px] font-bold tracking-[-0.04em] text-fg-strong">
        dropbase<span className="text-brand">.</span>{" "}
        <span className="align-middle font-mono text-[10px] tracking-label text-fg-faint">
          OPS
        </span>
      </div>
      <nav className="flex flex-col gap-0.5">
        <span className="flex items-center gap-3 rounded-md bg-surface-2 px-2.5 py-2.5 font-ui text-[14px] text-fg-strong shadow-[inset_2px_0_0_var(--color-magenta-500)]">
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
  );
}
