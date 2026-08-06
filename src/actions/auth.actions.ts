"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export type LoginActionState =
  | { status: "idle" }
  | { status: "error"; message: string };

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
    return { status: "idle" };
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: "error", message: "E-mail ou senha inválidos." };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
