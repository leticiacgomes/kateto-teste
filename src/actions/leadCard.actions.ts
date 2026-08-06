"use server";

import { revalidatePath } from "next/cache";
import { authActionClient } from "@/middlewares/auth.middleware";
import { leadCardService } from "@/services/leadCard.service";
import { moveLeadSchema } from "@/validators/lead.schema";

export const moveLeadAction = authActionClient
  .inputSchema(moveLeadSchema)
  .stateAction(async ({ parsedInput }) => {
    await leadCardService.moveLead(parsedInput);
    revalidatePath("/dashboard");
  });
