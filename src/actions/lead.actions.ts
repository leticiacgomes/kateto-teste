"use server";

import { leadService } from "@/services/lead.service";
import { createLeadSchema } from "@/validators/lead.schema";

export type CreateLeadFieldErrors = Partial<
  Record<"name" | "phone" | "skinId", string[]>
>;

export type CreateLeadActionState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: CreateLeadFieldErrors };

export async function createLeadAction(
  _prevState: CreateLeadActionState,
  formData: FormData,
): Promise<CreateLeadActionState> {
  const parsed = createLeadSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    skinId: formData.get("skinId"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos do formulário.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await leadService.createLead(parsed.data);
  } catch (error) {
    console.error("createLeadAction failed", error);
    return {
      status: "error",
      message: "Não foi possível enviar seu contato. Tente novamente.",
    };
  }

  return { status: "success" };
}
