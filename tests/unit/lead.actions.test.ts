import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/lead.service", () => ({
  leadService: { createLead: vi.fn() },
}));

import { createLeadAction } from "@/actions/lead.actions";
import { leadService } from "@/services/lead.service";

const createLeadMock = vi.mocked(leadService.createLead);

function buildFormData(
  fields: Partial<Record<"name" | "phone" | "skinId", string>>,
) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) formData.set(key, value);
  }
  return formData;
}

beforeEach(() => {
  createLeadMock.mockReset();
});

describe("createLeadAction", () => {
  it("valida, normaliza o telefone e cria o lead", async () => {
    createLeadMock.mockResolvedValueOnce({
      id: "lead-1",
      name: "Fulano",
      phone: "11999999999",
      skinId: "skin-1",
      representativeId: "rep-1",
      status: "SEM_CONTATO",
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      // biome-ignore lint/suspicious/noExplicitAny: shape do generated Prisma Lead não importa pro teste
    } as any);

    const formData = buildFormData({
      name: "Fulano",
      phone: "(11) 99999-9999",
      skinId: "skin-1",
    });

    const result = await createLeadAction({}, formData);

    expect(createLeadMock).toHaveBeenCalledWith({
      name: "Fulano",
      phone: "11999999999",
      skinId: "skin-1",
    });
    expect(result.data).toEqual({ success: true });
  });

  it("retorna validationErrors e não chama o service quando os campos são inválidos", async () => {
    const formData = buildFormData({ name: "A", phone: "123", skinId: "" });

    const result = await createLeadAction({}, formData);

    expect(createLeadMock).not.toHaveBeenCalled();
    expect(result.validationErrors?.fieldErrors?.name).toBeTruthy();
    expect(result.validationErrors?.fieldErrors?.phone).toBeTruthy();
    expect(result.validationErrors?.fieldErrors?.skinId).toBeTruthy();
  });

  it("retorna erro genérico quando o service falha", async () => {
    createLeadMock.mockRejectedValueOnce(new Error("db down"));

    const formData = buildFormData({
      name: "Fulano",
      phone: "11999999999",
      skinId: "skin-1",
    });

    const result = await createLeadAction({}, formData);

    expect(result.serverError).toBe(
      "Não foi possível concluir a operação. Tente novamente.",
    );
  });
});
