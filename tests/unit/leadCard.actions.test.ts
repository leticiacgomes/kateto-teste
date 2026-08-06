import { beforeEach, describe, expect, it, vi } from "vitest";
import { LeadStatus } from "../../generated/prisma/enums";

vi.mock("@/services/leadCard.service", () => ({
  leadCardService: { moveLead: vi.fn() },
}));

// `revalidatePath` assume um request scope do App Router que não existe
// sob Vitest.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { moveLeadAction } from "@/actions/leadCard.actions";
import { leadCardService } from "@/services/leadCard.service";
// `authActionClient` (middlewares/auth.middleware.ts) chama `auth()` de
// `@/auth` — mockado centralizadamente em tests/auth.mock.ts.
import { authMock } from "../auth.mock";

const moveLeadMock = vi.mocked(leadCardService.moveLead);

const validInput = {
  leadId: "lead-1",
  status: LeadStatus.EM_CONTATO,
  index: 0,
};

beforeEach(() => {
  moveLeadMock.mockReset();
});

describe("moveLeadAction", () => {
  it("rejeita sem sessão, sem chamar o service", async () => {
    authMock.mockResolvedValueOnce(null);

    const result = await moveLeadAction({}, validInput);

    expect(moveLeadMock).not.toHaveBeenCalled();
    expect(result.serverError).toBe("Sessão expirada. Faça login novamente.");
  });

  it("rejeita quando a sessão não tem user, sem chamar o service", async () => {
    authMock.mockResolvedValueOnce({});

    const result = await moveLeadAction({}, validInput);

    expect(moveLeadMock).not.toHaveBeenCalled();
    expect(result.serverError).toBe("Sessão expirada. Faça login novamente.");
  });

  it("com sessão válida, valida input e chama o service", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    moveLeadMock.mockResolvedValueOnce(undefined);

    const result = await moveLeadAction({}, validInput);

    expect(moveLeadMock).toHaveBeenCalledWith(validInput);
    expect(result.serverError).toBeUndefined();
  });

  it("com sessão válida mas input inválido, não chama o service", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });

    const result = await moveLeadAction(
      {},
      { leadId: "", status: LeadStatus.EM_CONTATO, index: -1 },
    );

    expect(moveLeadMock).not.toHaveBeenCalled();
    expect(result.validationErrors).toBeTruthy();
  });
});
