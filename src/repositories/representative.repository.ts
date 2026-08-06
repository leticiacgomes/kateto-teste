import type { Representative } from "../../generated/prisma/client";
import type { Db } from "../../types/prisma";

export const representativeRepository = {
  findByOrder(db: Db, order: number): Promise<Representative> {
    return db.representative.findUniqueOrThrow({ where: { order } });
  },

  count(db: Db): Promise<number> {
    return db.representative.count();
  },
};
