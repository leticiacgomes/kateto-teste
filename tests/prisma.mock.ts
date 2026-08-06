import { beforeEach, vi } from "vitest";
import { type DeepMockProxy, mockDeep, mockReset } from "vitest-mock-extended";
import type { PrismaClient } from "../generated/prisma/client.js";
import { prisma } from "@/lib/prisma";

// Padrão da doc oficial do Prisma pra unit test (mock no nível do módulo):
// https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing
// O vi.mock hoisted aqui substitui @/lib/prisma inteiro por um mock profundo
// pra qualquer arquivo que importe este helper antes do código sob teste —
// o código de produção continua importando o singleton normalmente, sem
// saber que está sendo mockado.
vi.mock("@/lib/prisma", () => ({
  prisma: mockDeep<PrismaClient>(),
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});
