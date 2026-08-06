"use client";

import type {
  KanbanLead,
  LeadStatusKey,
} from "@/components/kanban/KanbanBoard";
import { Avatar } from "@/components/ui/display/Avatar";
import { RarityBadge } from "@/components/ui/display/RarityBadge";
import { STATUS, StatusPill } from "@/components/ui/display/StatusPill";
import { Button } from "@/components/ui/forms/Button";
import { cn } from "@/lib/cn";

const STAGE_ORDER: LeadStatusKey[] = [
  "SEM_CONTATO",
  "EM_CONTATO",
  "PERDIDO",
  "FINALIZADO",
];

export type DrawerLead = KanbanLead & {
  rarity: "common" | "rare" | "epic" | "legendary";
  representativeName: string;
  createdAtLabel: string;
};

export function LeadDrawer({
  lead,
  onClose,
  onStage,
}: {
  lead: DrawerLead | null;
  onClose: () => void;
  onStage: (leadId: string, status: LeadStatusKey) => void;
}) {
  if (!lead) return null;

  const rowClass =
    "flex justify-between border-b border-line-subtle py-2.5 font-ui text-[14px]";

  return (
    <>
      <button
        type="button"
        aria-label="Fechar detalhes do lead"
        onClick={onClose}
        className="absolute inset-0 z-40 cursor-default bg-surface-overlay backdrop-blur-[2px]"
      />
      <aside className="absolute top-0 right-0 bottom-0 z-50 flex w-[420px] flex-col border-l border-line-default bg-surface-1 shadow-lg">
        <div className="flex items-center gap-3.5 border-b border-line-subtle px-6 py-5.5">
          <Avatar name={lead.name} size="lg" tone="magenta" />
          <div className="flex-1">
            <div className="font-display text-[20px] font-bold tracking-[-0.02em] text-fg-strong">
              {lead.name}
            </div>
            <div className="font-mono text-[12px] text-fg-faint">
              {lead.phone}
            </div>
          </div>
          <StatusPill status={lead.status} />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4.5">
          <div className="mb-1.5 font-mono text-[11px] uppercase tracking-label text-fg-faint">
            Mover para
          </div>
          <div className="mb-5.5 flex flex-wrap gap-2">
            {STAGE_ORDER.map((key) => {
              const on = key === lead.status;
              const s = STATUS[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onStage(lead.id, key)}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-[7px] rounded-full border px-[11px] py-1.5 font-ui text-[13px]",
                    on
                      ? cn("bg-surface-3 text-fg-strong", s.ring)
                      : "border-line-default text-fg-muted",
                  )}
                >
                  <span className={cn("h-[7px] w-[7px] rounded-full", s.dot)} />
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className={rowClass}>
            <span className="text-fg-faint">Skin de interesse</span>
            <span className="font-mono text-[13px] text-fg-body">
              {lead.djName} — {lead.skinName}
            </span>
          </div>
          <div className={rowClass}>
            <span className="text-fg-faint">Raridade</span>
            <RarityBadge tier={lead.rarity} size="sm" />
          </div>
          <div className={rowClass}>
            <span className="text-fg-faint">Valor</span>
            <span className="font-mono text-[13px] font-bold text-fg-strong">
              ${lead.skinPrice.toLocaleString()}
            </span>
          </div>
          <div className={rowClass}>
            <span className="text-fg-faint">Vendedor</span>
            <span className="font-mono text-[13px] text-fg-body">
              {lead.representativeName}
            </span>
          </div>
          <div className={rowClass}>
            <span className="text-fg-faint">Criado em</span>
            <span className="font-mono text-[13px] text-fg-body">
              {lead.createdAtLabel}
            </span>
          </div>
        </div>
        <div className="flex gap-2.5 border-t border-line-subtle px-6 py-4">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Fechar
          </Button>
        </div>
      </aside>
    </>
  );
}
