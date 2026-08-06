import { beforeEach, describe, expect, it } from "vitest";
import { LeadStatus, type Lead } from "../../generated/prisma/client";
import { cardService } from "../../src/services/card.service.js";
import { prismaMock } from "../prisma.mock.js";

beforeEach(() => {
  prismaMock.$transaction.mockImplementation((callback) =>
    (callback as (tx: typeof prismaMock) => Promise<unknown>)(prismaMock),
  );
});

function lead(id: string, position: number): Lead {
  return {
    id,
    name: id,
    phone: "11999999999",
    status: LeadStatus.EM_CONTATO,
    position,
    skinId: "skin-1",
    representativeId: "rep-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("cardService.moveLead", () => {
  it("insere o lead no índice pedido e renumera a coluna de destino inteira em uma única query", async () => {
    prismaMock.lead.findMany.mockResolvedValueOnce([lead("a", 0), lead("b", 1)]);

    await cardService.moveLead({ leadId: "x", status: LeadStatus.EM_CONTATO, index: 1 });

    expect(prismaMock.lead.findMany).toHaveBeenCalledWith({
      where: { status: LeadStatus.EM_CONTATO, id: { not: "x" } },
      orderBy: { position: "asc" },
    });

    // Reordenar a coluna nunca deve virar um update por lead num loop
    // (N+1) — precisa ser uma única query em lote. Ver CLAUDE.md.
    expect(prismaMock.lead.update).not.toHaveBeenCalled();
    expect(prismaMock.$executeRaw).toHaveBeenCalledOnce();
  });

  it("clampa índices fora do intervalo pro fim da coluna, ainda em uma única query", async () => {
    prismaMock.lead.findMany.mockResolvedValueOnce([lead("a", 0)]);

    await cardService.moveLead({ leadId: "x", status: LeadStatus.PERDIDO, index: 99 });

    expect(prismaMock.lead.update).not.toHaveBeenCalled();
    expect(prismaMock.$executeRaw).toHaveBeenCalledOnce();
  });

  it("coluna de destino vazia: lead movido vira a única posição", async () => {
    prismaMock.lead.findMany.mockResolvedValueOnce([]);

    await cardService.moveLead({ leadId: "x", status: LeadStatus.FINALIZADO, index: 0 });

    expect(prismaMock.lead.update).not.toHaveBeenCalled();
    expect(prismaMock.$executeRaw).toHaveBeenCalledOnce();
  });
});
