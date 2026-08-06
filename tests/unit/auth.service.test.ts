import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/repositories/user.repository", () => ({
  userRepository: { findByEmail: vi.fn() },
}));

// Mocks síntéticos: `login()` importa `@/auth` e `next-auth` de forma
// adiada (ver src/services/auth.service.ts) justamente pra evitar carregar
// o NextAuth de verdade — que puxa `next/server` e quebra sob Vitest. Um
// `vi.importActual` aqui reintroduziria o mesmo problema, então os mocks
// não tocam o pacote real em nenhum momento.
class MockAuthError extends Error {}
const signInMock = vi.fn();
vi.mock("@/auth", () => ({ signIn: signInMock }));
vi.mock("next-auth", () => ({ AuthError: MockAuthError }));

import { userRepository } from "@/repositories/user.repository";
import { authService } from "@/services/auth.service";

const findByEmailMock = vi.mocked(userRepository.findByEmail);

beforeEach(() => {
  findByEmailMock.mockReset();
  signInMock.mockReset();
});

describe("authService.verifyCredentials", () => {
  it("retorna o usuário (sem passwordHash) quando a senha bate", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 10);
    findByEmailMock.mockResolvedValueOnce({
      id: "user-1",
      email: "admin@dropbase.com",
      name: "Admin",
      passwordHash,
      createdAt: new Date(),
    });

    const result = await authService.verifyCredentials(
      "admin@dropbase.com",
      "correct-password",
    );

    expect(result).toEqual({
      id: "user-1",
      email: "admin@dropbase.com",
      name: "Admin",
    });
  });

  it("retorna null quando a senha não bate", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 10);
    findByEmailMock.mockResolvedValueOnce({
      id: "user-1",
      email: "admin@dropbase.com",
      name: "Admin",
      passwordHash,
      createdAt: new Date(),
    });

    const result = await authService.verifyCredentials(
      "admin@dropbase.com",
      "wrong-password",
    );

    expect(result).toBeNull();
  });

  it("retorna null quando o e-mail não existe", async () => {
    findByEmailMock.mockResolvedValueOnce(null);

    const result = await authService.verifyCredentials(
      "ninguem@dropbase.com",
      "qualquer-senha",
    );

    expect(result).toBeNull();
    expect(findByEmailMock).toHaveBeenCalledWith(
      expect.anything(),
      "ninguem@dropbase.com",
    );
  });
});

describe("authService.login", () => {
  it("chama signIn com as credenciais e redirectTo corretos", async () => {
    signInMock.mockResolvedValueOnce(undefined);

    await authService.login("admin@dropbase.com", "correct-password");

    expect(signInMock).toHaveBeenCalledWith("credentials", {
      email: "admin@dropbase.com",
      password: "correct-password",
      redirectTo: "/dashboard",
    });
  });

  it("traduz AuthError em ApplicationError com mensagem segura", async () => {
    signInMock.mockRejectedValueOnce(new MockAuthError("CredentialsSignin"));

    await expect(
      authService.login("admin@dropbase.com", "wrong-password"),
    ).rejects.toThrow("E-mail ou senha inválidos.");
  });

  it("repassa qualquer outro erro sem alterar (ex: redirect do Next.js)", async () => {
    const redirectError = new Error("NEXT_REDIRECT");
    signInMock.mockRejectedValueOnce(redirectError);

    await expect(
      authService.login("admin@dropbase.com", "correct-password"),
    ).rejects.toBe(redirectError);
  });
});
