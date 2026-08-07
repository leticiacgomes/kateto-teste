"use server";

import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { leadService } from "@/services/lead.service";
import { createLeadSchema } from "@/validators/lead.schema";

export const createLeadAction = actionClient
  .inputSchema(createLeadSchema)
  .stateAction(async ({ parsedInput }) => {
    await leadService.createLead(parsedInput);
    revalidatePath("/dashboard");
    return { success: true };
  });
