"use server";

import { revalidatePath } from "next/cache";
import { cardService } from "@/services/card.service";
import { LeadStatus } from "../../generated/prisma/client";

const VALID_STATUSES = new Set<string>(Object.values(LeadStatus));

export type MoveLeadActionResult =
  | { ok: true }
  | { ok: false; message: string };

export async function moveLeadAction(
  leadId: string,
  status: string,
  index: number,
): Promise<MoveLeadActionResult> {
  if (!VALID_STATUSES.has(status)) {
    return { ok: false, message: `Status inválido: ${status}` };
  }

  try {
    await cardService.moveLead({ leadId, status: status as LeadStatus, index });
  } catch (error) {
    console.error("moveLeadAction failed", error);
    return {
      ok: false,
      message: "Não foi possível mover o lead. Tente novamente.",
    };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
