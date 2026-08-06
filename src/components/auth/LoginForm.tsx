"use client";

import { useActionState } from "react";
import { type LoginActionState, loginAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/forms/Button";
import { Input } from "@/components/ui/forms/Input";

const initialState: LoginActionState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        name="email"
        type="email"
        label="E-mail"
        placeholder="voce@dropbase.com"
        autoComplete="email"
        required
      />
      <Input
        name="password"
        type="password"
        label="Senha"
        placeholder="••••••••"
        autoComplete="current-password"
        required
      />
      {state.status === "error" && (
        <p className="font-ui text-body-sm text-danger">{state.message}</p>
      )}
      <Button type="submit" size="lg" fullWidth disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
