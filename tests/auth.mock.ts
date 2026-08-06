import { beforeEach, vi } from "vitest";

/**
 * `@/auth` (config do NextAuth) e o pacote `next-auth` puxam a cadeia até
 * `next/server`, que quebra sob Vitest.
 *
 * `vi.hoisted` (em vez do padrão "factory sem referência externa +
 * reimport" de tests/prisma.mock.ts) porque reexportar um valor lido de
 * volta de um pacote de node_modules mockado (`next-auth`, especificamente
 * — diferente de `@/auth`, que é um path local via alias) não se propagou
 * de forma confiável pra quem importa este helper num arquivo diferente:
 * o import de `AuthError` voltava `undefined` no arquivo de teste, mesmo
 * com o mock aplicado corretamente no código de produção. `vi.hoisted`
 * evita depender dessa reexportação: guardamos a mesma referência que vai
 * pra dentro da factory e exportamos ela diretamente.
 */
const { authMock, signInMock, signOutMock, MockAuthError } = vi.hoisted(() => {
  class MockAuthError extends Error {}
  return {
    authMock: vi.fn(),
    signInMock: vi.fn(),
    signOutMock: vi.fn(),
    MockAuthError,
  };
});

vi.mock("@/auth", () => ({
  auth: authMock,
  signIn: signInMock,
  signOut: signOutMock,
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));

vi.mock("next-auth", () => ({ AuthError: MockAuthError }));

export { authMock, signInMock, signOutMock, MockAuthError as AuthError };

beforeEach(() => {
  authMock.mockReset();
  signInMock.mockReset();
  signOutMock.mockReset();
});
