import { prisma } from "@/lib/prisma";
import { leadRepository } from "@/repositories/lead.repository";
import type { LeadStatus } from "../../generated/prisma/client";

export type MoveLeadInput = {
  leadId: string;
  status: LeadStatus;
  index: number;
};

export const cardService = {
  async moveLead(input: MoveLeadInput): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const columnLeads = await leadRepository.listByStatusOrdered(
        tx,
        input.status,
        input.leadId,
      );
      const clampedIndex = Math.max(
        0,
        Math.min(input.index, columnLeads.length),
      );
      const orderedIds = [
        ...columnLeads.slice(0, clampedIndex).map((lead) => lead.id),
        input.leadId,
        ...columnLeads.slice(clampedIndex).map((lead) => lead.id),
      ];

      await leadRepository.reorderColumn(tx, input.status, orderedIds);
    });
  },
};
