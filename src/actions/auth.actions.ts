"use server";

import { z } from "zod";
import { zfd } from "zod-form-data";
import { signOut } from "@/auth";
import { actionClient } from "@/lib/safe-action";
import { authActionClient } from "@/middlewares/auth.middleware";
import { authService } from "@/services/auth.service";

const loginSchema = zfd.formData({
  email: zfd.text(z.string().trim().min(1, "Informe seu e-mail.")),
  password: zfd.text(z.string().min(1, "Informe sua senha.")),
});

export const loginAction = actionClient
  .inputSchema(loginSchema)
  .stateAction(async ({ parsedInput }) => {
    await authService.login(parsedInput.email, parsedInput.password);
  });

export const logoutAction = authActionClient.stateAction(async () => {
  await signOut({ redirectTo: "/login" });
});
