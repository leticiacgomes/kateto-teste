import { logoutAction } from "@/actions/auth.actions";

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
      <form action={logoutAction}>
        <button
          type="submit"
          className="cursor-pointer rounded-sm border border-line-default bg-transparent px-3.5 py-2 font-ui text-body-sm text-fg-muted transition-colors duration-[140ms] ease-standard hover:border-line-strong hover:text-fg-strong"
        >
          Sair
        </button>
      </form>
    </header>
  );
}
