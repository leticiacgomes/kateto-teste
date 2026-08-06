import { prisma } from "@/lib/prisma";
import { leadRepository } from "@/repositories/lead.repository";
import type { LeadStatus } from "../../generated/prisma/client";

export type MoveLeadInput = {
  leadId: string;
  status: LeadStatus;
  index: number;
};

export const leadCardService = {
  async moveLead(input: MoveLeadInput): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const lead = await leadRepository.findById(tx, input.leadId);

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

      // Renumera também a coluna de origem quando o lead troca de coluna —
      // sem isso, ela fica com um buraco (posições não contíguas) que pode
      // colidir com a posição de um lead futuro calculada por contagem
      // (ver leadService.createLead).
      if (lead.status !== input.status) {
        const sourceColumnLeads = await leadRepository.listByStatusOrdered(
          tx,
          lead.status,
          input.leadId,
        );
        await leadRepository.reorderColumn(
          tx,
          lead.status,
          sourceColumnLeads.map((sourceLead) => sourceLead.id),
        );
      }
    });
  },
};
