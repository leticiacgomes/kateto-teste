import type { Skin } from "../../generated/prisma/client";
import type { Db } from "../../types/prisma";

export type SkinWithDj = Skin & { dj: { id: string; name: string } };

export const skinRepository = {
  listWithDj(db: Db): Promise<SkinWithDj[]> {
    return db.skin.findMany({
      include: { dj: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    });
  },
};
