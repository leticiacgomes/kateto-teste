import type {
  Prisma,
  PrismaClient,
  RoundRobinState,
} from "../../generated/prisma/client.js";

type Db = PrismaClient | Prisma.TransactionClient;

// Linha única (id fixo = 1) que guarda o ponteiro do round robin.
const ROUND_ROBIN_STATE_ID = 1;

export const roundRobinRepository = {
  async getRoundRobinState(db: Db): Promise<RoundRobinState> {
    const rows = await db.$queryRaw<RoundRobinState[]>`
      SELECT * FROM "RoundRobinState" WHERE id = ${ROUND_ROBIN_STATE_ID} FOR UPDATE
    `;
    const state = rows[0];

    if (!state) throw new Error("RoundRobinState not found.");

    return state;
  },

  setNextIndex(db: Db, nextIndex: number): Promise<RoundRobinState> {
    return db.roundRobinState.update({
      where: { id: ROUND_ROBIN_STATE_ID },
      data: { nextIndex },
    });
  },
};
