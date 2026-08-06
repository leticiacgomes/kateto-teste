import type { Card } from "../../generated/prisma/client";
import type { Db } from "../../types/prisma";

export type CardWithDj = Card & { dj: { id: string; name: string } };

export const cardRepository = {
  listWithDj(db: Db): Promise<CardWithDj[]> {
    return db.card.findMany({
      include: { dj: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    });
  },
};
