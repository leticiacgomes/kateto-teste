import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { userRepository } from "@/repositories/user.repository";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
};

export const authService = {
  async verifyCredentials(
    email: string,
    password: string,
  ): Promise<AuthenticatedUser | null> {
    const user = await userRepository.findByEmail(prisma, email);
    if (!user) return null;

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) return null;

    return { id: user.id, email: user.email, name: user.name };
  },
};
