import { prisma } from "@/lib/prisma";
import { leadRepository } from "@/repositories/lead.repository";
import { representativeRepository } from "@/repositories/representative.repository";
import { roundRobinRepository } from "@/repositories/roundRobin.repository.js";
import { roundRobinService } from "@/services/round-robin.service";
import { type Lead, LeadStatus } from "../../generated/prisma/client.js";

export type CreateLeadInput = {
  name: string;
  phone: string;
  skinId: string;
};

export const leadService = {
  async createLead(input: CreateLeadInput): Promise<Lead> {
    return prisma.$transaction(async (tx) => {
      const state = await roundRobinRepository.getRoundRobinState(tx);
      const totalRepresentatives = await representativeRepository.count(tx);
      const representative = await representativeRepository.findByOrder(
        tx,
        state.nextIndex,
      );

      const nextIndex = roundRobinService.computeNextIndex(
        state.nextIndex,
        totalRepresentatives,
      );

      await roundRobinRepository.setNextIndex(tx, nextIndex);

      const position = await leadRepository.countByStatus(
        tx,
        LeadStatus.SEM_CONTATO,
      );

      return leadRepository.create(tx, {
        name: input.name,
        phone: input.phone,
        skinId: input.skinId,
        representativeId: representative.id,
        status: LeadStatus.SEM_CONTATO,
        position,
      });
    });
  },
};
