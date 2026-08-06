import { beforeEach, describe, expect, it } from "vitest";
import { prismaMock } from "../prisma.mock.js";
import {
  LeadStatus,
  type Representative,
} from "../../generated/prisma/client.js";
import { leadService } from "../../src/services/lead.service.js";

// Este arquivo cobre a orquestração (sequência de chamadas, dados repassados
// pro repository) com o Postgres mockado — ver src/lib/prisma.mock.ts. A
// garantia de concorrência do SELECT ... FOR UPDATE (dois leads simultâneos
// não roubarem o mesmo vendedor) não é testável com mock e fica pra um teste
// de integração contra Postgres real, em outro contexto.

beforeEach(() => {
  prismaMock.$transaction.mockImplementation((callback) =>
    (callback as (tx: typeof prismaMock) => Promise<unknown>)(prismaMock),
  );
});

describe("leadService.createLead", () => {
  it("atribui o representative do nextIndex atual e cria o lead na coluna SEM_CONTATO", async () => {
    const marcelo = {
      id: "rep-marcelo",
      name: "Marcelo",
      order: 0,
    } as Representative;

    prismaMock.$queryRaw.mockResolvedValueOnce([
      { id: 1, nextIndex: 0, updatedAt: new Date() },
    ]);
    prismaMock.representative.count.mockResolvedValueOnce(5);
    prismaMock.representative.findUniqueOrThrow.mockResolvedValueOnce(marcelo);
    prismaMock.lead.count.mockResolvedValueOnce(3);
    prismaMock.lead.create.mockResolvedValueOnce({
      id: "lead-1",
      name: "Fulano",
      phone: "11999999999",
      skinId: "skin-1",
      representativeId: marcelo.id,
      status: LeadStatus.SEM_CONTATO,
      position: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const lead = await leadService.createLead({
      name: "Fulano",
      phone: "11999999999",
      skinId: "skin-1",
    });

    expect(prismaMock.representative.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { order: 0 },
    });
    expect(prismaMock.roundRobinState.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { nextIndex: 1 },
    });
    expect(prismaMock.lead.create).toHaveBeenCalledWith({
      data: {
        name: "Fulano",
        phone: "11999999999",
        skinId: "skin-1",
        representativeId: "rep-marcelo",
        status: LeadStatus.SEM_CONTATO,
        position: 3,
      },
    });
    expect(lead.representativeId).toBe("rep-marcelo");
  });

  it("dá a volta na fila quando o nextIndex está no último representative (Leonardo -> Marcelo)", async () => {
    const leonardo = {
      id: "rep-leonardo",
      name: "Leonardo",
      order: 4,
    } as Representative;

    prismaMock.$queryRaw.mockResolvedValueOnce([
      { id: 1, nextIndex: 4, updatedAt: new Date() },
    ]);
    prismaMock.representative.count.mockResolvedValueOnce(5);
    prismaMock.representative.findUniqueOrThrow.mockResolvedValueOnce(leonardo);
    prismaMock.lead.count.mockResolvedValueOnce(0);
    prismaMock.lead.create.mockResolvedValueOnce({
      id: "lead-2",
      name: "Ciclana",
      phone: "11888888888",
      skinId: "skin-1",
      representativeId: leonardo.id,
      status: LeadStatus.SEM_CONTATO,
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await leadService.createLead({
      name: "Ciclana",
      phone: "11888888888",
      skinId: "skin-1",
    });

    expect(prismaMock.roundRobinState.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { nextIndex: 0 },
    });
  });
});
