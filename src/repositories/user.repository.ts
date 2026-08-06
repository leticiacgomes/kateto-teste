import type { User } from "../../generated/prisma/client";
import type { Db } from "../../types/prisma";

export const userRepository = {
  findByEmail(db: Db, email: string): Promise<User | null> {
    return db.user.findUnique({ where: { email } });
  },
};
