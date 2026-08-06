import { auth } from "@/auth";
import { ApplicationError, actionClient } from "@/lib/safe-action";

/** Client base pra actions que exigem sessão — equivalente a uma APIView com `permission_classes = [IsAuthenticated]`. */
export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth();
  if (!session?.user) {
    throw new ApplicationError("Sessão expirada. Faça login novamente.");
  }
  return next({ ctx: { session } });
});
