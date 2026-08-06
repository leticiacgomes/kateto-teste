"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "@/middlewares/auth.middleware";
import { cardService } from "@/services/card.service";
import { LeadStatus } from "../../generated/prisma/client";

const moveLeadSchema = z.object({
  leadId: z.string().min(1),
  status: z.enum(LeadStatus),
  index: z.number().int().min(0),
});

export const moveLeadAction = authActionClient
  .inputSchema(moveLeadSchema)
  .stateAction(async ({ parsedInput }) => {
    await cardService.moveLead(parsedInput);
    revalidatePath("/dashboard");
  });
