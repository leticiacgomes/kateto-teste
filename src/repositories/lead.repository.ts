import type { Lead, LeadStatus } from "../../generated/prisma/client";
import { Prisma } from "../../generated/prisma/client";
import type { Db } from "../../types/prisma";

export type CreateLeadData = {
  name: string;
  phone: string;
  cardId: string;
  representativeId: string;
  status: LeadStatus;
  position: number;
};

export const leadRepository = {
  countByStatus(db: Db, status: LeadStatus): Promise<number> {
    return db.lead.count({ where: { status } });
  },

  findById(db: Db, id: string): Promise<Lead> {
    return db.lead.findUniqueOrThrow({ where: { id } });
  },

  create(db: Db, data: CreateLeadData): Promise<Lead> {
    return db.lead.create({ data });
  },

  listAllWithDetails(db: Db) {
    return db.lead.findMany({
      include: {
        card: { include: { dj: { select: { id: true, name: true } } } },
        representative: { select: { id: true, name: true } },
      },
      orderBy: { position: "asc" },
    });
  },

  /** Leads currently in `status`, ordered by position, excluding `excludeId` (the lead being moved). */
  listByStatusOrdered(
    db: Db,
    status: LeadStatus,
    excludeId: string,
  ): Promise<Lead[]> {
    return db.lead.findMany({
      where: { status, id: { not: excludeId } },
      orderBy: { position: "asc" },
    });
  },

  /**
   * Atualiza status e position de todos os leads de `orderedIds` (na ordem
   * dada) em uma única query. Ver CLAUDE.md — "Evitar N+1": nunca fazer
   * isso com um update por id dentro de um loop.
   */
  async reorderColumn(
    db: Db,
    status: LeadStatus,
    orderedIds: string[],
  ): Promise<void> {
    if (orderedIds.length === 0) return;

    const rows = Prisma.join(
      orderedIds.map(
        (id, position) => Prisma.sql`(${id}::text, ${position}::int)`,
      ),
    );

    await db.$executeRaw`
      UPDATE "Lead" AS lead
      SET status = ${status}::"LeadStatus",
          position = data.position,
          "updatedAt" = now()
      FROM (VALUES ${rows}) AS data(id, position)
      WHERE lead.id = data.id
    `;
  },
};
