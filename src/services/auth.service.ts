import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ApplicationError } from "@/lib/safe-action";
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

  async login(email: string, password: string): Promise<void> {
    // Imports adiados: `signIn` tem que vir de `@/auth` (a instância
    // server-side do NextAuth configurada no projeto), não de
    // `next-auth/react` (versão client-side, usa fetch pra API route — não
    // funciona aqui dentro). E tanto `@/auth` quanto `"next-auth"` puxam a
    // cadeia até `next/server` na avaliação do módulo, o que quebraria o
    // teste de `verifyCredentials` se importados no topo do arquivo.
    const [{ signIn }, { AuthError }] = await Promise.all([
      import("@/auth"),
      import("next-auth"),
    ]);
    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/dashboard",
      });
    } catch (error) {
      if (error instanceof AuthError) {
        throw new ApplicationError("E-mail ou senha inválidos.");
      }
      throw error;
    }
  },
};
