import type {
  Prisma,
  PrismaClient,
  Representative,
} from "../../generated/prisma/client.js";

type Db = PrismaClient | Prisma.TransactionClient;

export const representativeRepository = {
  findByOrder(db: Db, order: number): Promise<Representative> {
    return db.representative.findUniqueOrThrow({ where: { order } });
  },

  count(db: Db): Promise<number> {
    return db.representative.count();
  },
};
