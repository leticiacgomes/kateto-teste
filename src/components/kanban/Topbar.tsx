"use client";

import { useActionState } from "react";
import { logoutAction } from "@/actions/auth.actions";
import { IconButton } from "@/components/ui/forms/IconButton";

export function Topbar({
  totalLeads,
  onMenuClick,
}: {
  totalLeads: number;
  onMenuClick?: () => void;
}) {
  const [, formAction, pending] = useActionState(logoutAction, {});

  return (
    <header className="flex items-center justify-between border-b border-line-subtle bg-surface-app px-4 py-3.5 sm:px-6">
      <div className="flex items-center gap-3">
        <IconButton
          label="Abrir menu"
          variant="solid"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <title>Menu</title>
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </IconButton>
        <div>
          <h1 className="m-0 font-display text-h4 font-bold tracking-heading text-fg-strong">
            Leads
          </h1>
          <div className="mt-0.5 font-mono text-micro tracking-label text-fg-faint">
            Pipeline · {totalLeads} {totalLeads === 1 ? "lead" : "leads"}
          </div>
        </div>
      </div>
      <form action={formAction}>
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-sm border border-line-default bg-transparent px-3.5 py-2 font-ui text-body-sm text-fg-muted transition-colors duration-[140ms] ease-standard hover:border-line-strong hover:text-fg-strong"
        >
          {pending ? "Saindo…" : "Sair"}
        </button>
      </form>
    </header>
  );
}
