"use server";

import { actionClient } from "@/lib/safe-action";
import { leadService } from "@/services/lead.service";
import { createLeadSchema } from "@/validators/lead.schema";

export const createLeadAction = actionClient
  .inputSchema(createLeadSchema)
  .stateAction(async ({ parsedInput }) => {
    await leadService.createLead(parsedInput);
    return { success: true };
  });
