import { beforeEach, describe, expect, it } from "vitest";
import { type Lead, LeadStatus } from "../../generated/prisma/client";
import { leadCardService } from "../../src/services/leadCard.service.js";
import { prismaMock } from "../prisma.mock.js";

beforeEach(() => {
  prismaMock.$transaction.mockImplementation((callback) =>
    (callback as (tx: typeof prismaMock) => Promise<unknown>)(prismaMock),
  );
});

function lead(
  id: string,
  position: number,
  status: LeadStatus = LeadStatus.EM_CONTATO,
): Lead {
  return {
    id,
    name: id,
    phone: "11999999999",
    status,
    position,
    cardId: "card-1",
    representativeId: "rep-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("leadCardService.moveLead", () => {
  it("reordenar dentro da mesma coluna: renumera só o destino, em uma única query", async () => {
    prismaMock.lead.findUniqueOrThrow.mockResolvedValueOnce(
      lead("x", 1, LeadStatus.EM_CONTATO),
    );
    prismaMock.lead.findMany.mockResolvedValueOnce([
      lead("a", 0),
      lead("b", 1),
    ]);

    await leadCardService.moveLead({
      leadId: "x",
      status: LeadStatus.EM_CONTATO,
      index: 1,
    });

    expect(prismaMock.lead.findMany).toHaveBeenCalledWith({
      where: { status: LeadStatus.EM_CONTATO, id: { not: "x" } },
      orderBy: { position: "asc" },
    });
    // Sem troca de coluna: nenhuma segunda leitura pra renumerar origem.
    expect(prismaMock.lead.findMany).toHaveBeenCalledOnce();

    // Reordenar a coluna nunca deve virar um update por lead num loop
    // (N+1) — precisa ser uma única query em lote. Ver CLAUDE.md.
    expect(prismaMock.lead.update).not.toHaveBeenCalled();
    expect(prismaMock.$executeRaw).toHaveBeenCalledOnce();
  });

  it("clampa índices fora do intervalo pro fim da coluna, ainda em uma única query", async () => {
    prismaMock.lead.findUniqueOrThrow.mockResolvedValueOnce(
      lead("x", 0, LeadStatus.PERDIDO),
    );
    prismaMock.lead.findMany.mockResolvedValueOnce([lead("a", 0)]);

    await leadCardService.moveLead({
      leadId: "x",
      status: LeadStatus.PERDIDO,
      index: 99,
    });

    expect(prismaMock.lead.update).not.toHaveBeenCalled();
    expect(prismaMock.$executeRaw).toHaveBeenCalledOnce();
  });

  it("coluna de destino vazia: lead movido vira a única posição", async () => {
    prismaMock.lead.findUniqueOrThrow.mockResolvedValueOnce(
      lead("x", 0, LeadStatus.FINALIZADO),
    );
    prismaMock.lead.findMany.mockResolvedValueOnce([]);

    await leadCardService.moveLead({
      leadId: "x",
      status: LeadStatus.FINALIZADO,
      index: 0,
    });

    expect(prismaMock.lead.update).not.toHaveBeenCalled();
    expect(prismaMock.$executeRaw).toHaveBeenCalledOnce();
  });

  it("move entre colunas: renumera destino e origem, cada um em uma única query", async () => {
    prismaMock.lead.findUniqueOrThrow.mockResolvedValueOnce(
      lead("x", 2, LeadStatus.SEM_CONTATO),
    );
    prismaMock.lead.findMany
      .mockResolvedValueOnce([lead("a", 0)]) // coluna de destino (EM_CONTATO)
      .mockResolvedValueOnce([lead("b", 0), lead("c", 1)]); // coluna de origem (SEM_CONTATO), sem "x"

    await leadCardService.moveLead({
      leadId: "x",
      status: LeadStatus.EM_CONTATO,
      index: 0,
    });

    expect(prismaMock.lead.findMany).toHaveBeenNthCalledWith(1, {
      where: { status: LeadStatus.EM_CONTATO, id: { not: "x" } },
      orderBy: { position: "asc" },
    });
    expect(prismaMock.lead.findMany).toHaveBeenNthCalledWith(2, {
      where: { status: LeadStatus.SEM_CONTATO, id: { not: "x" } },
      orderBy: { position: "asc" },
    });

    // Um update em lote pro destino + um pra origem — nenhum update por
    // lead num loop (N+1).
    expect(prismaMock.lead.update).not.toHaveBeenCalled();
    expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(2);
  });

  it("move entre colunas quando a origem fica vazia: não chama reorder pra origem vazia", async () => {
    prismaMock.lead.findUniqueOrThrow.mockResolvedValueOnce(
      lead("x", 0, LeadStatus.SEM_CONTATO),
    );
    prismaMock.lead.findMany
      .mockResolvedValueOnce([]) // coluna de destino (EM_CONTATO)
      .mockResolvedValueOnce([]); // coluna de origem (SEM_CONTATO) ficou vazia

    await leadCardService.moveLead({
      leadId: "x",
      status: LeadStatus.EM_CONTATO,
      index: 0,
    });

    // reorderColumn recebe orderedIds vazio pra origem e não emite query.
    expect(prismaMock.$executeRaw).toHaveBeenCalledOnce();
  });
});
