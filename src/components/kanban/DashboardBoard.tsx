"use client";

import { startTransition, useActionState, useState } from "react";
import {
  type MoveLeadActionResult,
  moveLeadAction,
} from "@/actions/card.actions";
import {
  KanbanBoard,
  type LeadStatusKey,
} from "@/components/kanban/KanbanBoard";
import { type DrawerLead, LeadDrawer } from "@/components/kanban/LeadDrawer";
import { Sidebar } from "@/components/kanban/Sidebar";
import { Topbar } from "@/components/kanban/Topbar";

type MovePayload = { leadId: string; status: LeadStatusKey; index: number };

const initialMoveState: MoveLeadActionResult = { ok: true };

export function DashboardBoard({ leads }: { leads: DrawerLead[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [moveState, dispatchMove] = useActionState(
    async (_prevState: MoveLeadActionResult, payload: MovePayload) =>
      moveLeadAction(payload.leadId, payload.status, payload.index),
    initialMoveState,
  );
  const openLead = leads.find((lead) => lead.id === openId) ?? null;

  return (
    <div className="relative flex h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar totalLeads={leads.length} />
        {!moveState.ok && (
          <div className="border-b border-danger/40 bg-danger/12 px-6 py-2 font-ui text-body-sm text-danger">
            {moveState.message}
          </div>
        )}
        <KanbanBoard
          initialLeads={leads}
          onOpen={setOpenId}
          onMove={(leadId, status, index) =>
            startTransition(() => dispatchMove({ leadId, status, index }))
          }
        />
      </div>
      <LeadDrawer
        lead={openLead}
        onClose={() => setOpenId(null)}
        onStage={(leadId, status) => {
          startTransition(() => dispatchMove({ leadId, status, index: 0 }));
          setOpenId(null);
        }}
      />
    </div>
  );
}
