import type { Lead, LeadStatus } from "../../generated/prisma/client";
import type { Db } from "../../types/prisma";

export type CreateLeadData = {
  name: string;
  phone: string;
  skinId: string;
  representativeId: string;
  status: LeadStatus;
  position: number;
};

export const leadRepository = {
  countByStatus(db: Db, status: LeadStatus): Promise<number> {
    return db.lead.count({ where: { status } });
  },

  create(db: Db, data: CreateLeadData): Promise<Lead> {
    return db.lead.create({ data });
  },
};
