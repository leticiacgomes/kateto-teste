export function Topbar({ totalLeads }: { totalLeads: number }) {
  return (
    <header className="flex items-center justify-between border-b border-line-subtle bg-surface-app px-6 py-3.5">
      <div>
        <h1 className="m-0 font-display text-[22px] font-bold tracking-[-0.02em] text-fg-strong">
          Leads
        </h1>
        <div className="mt-0.5 font-mono text-[11px] tracking-[0.04em] text-fg-faint">
          Pipeline · {totalLeads} {totalLeads === 1 ? "lead" : "leads"}
        </div>
      </div>
    </header>
  );
}
