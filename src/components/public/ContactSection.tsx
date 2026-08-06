"use client";

import { useActionState } from "react";
import {
  type CreateLeadActionState,
  createLeadAction,
} from "@/actions/lead.actions";
import { Button } from "@/components/ui/forms/Button";
import { Input } from "@/components/ui/forms/Input";
import { Select } from "@/components/ui/forms/Select";

const initialState: CreateLeadActionState = { status: "idle" };

export type SkinOption = { value: string; label: string };

export function ContactSection({ skinOptions }: { skinOptions: SkinOption[] }) {
  const [state, formAction, pending] = useActionState(
    createLeadAction,
    initialState,
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <section
      id="contact"
      className="border-t border-line-subtle bg-surface-app-deep px-10 py-20"
    >
      <div className="mx-auto grid max-w-[1000px] grid-cols-2 items-center gap-16">
        <div>
          <div className="mb-3 font-mono text-[12px] uppercase tracking-label text-magenta-400">
            Get on the list
          </div>
          <h2 className="mb-4 font-display text-[40px] leading-[1.05] font-bold tracking-[-0.025em] text-fg-strong">
            Tell us what you&apos;re hunting for.
          </h2>
          <p className="font-ui text-[16px] leading-[1.6] text-fg-muted">
            Drops move fast and most never hit the public catalog. Leave your
            details and a curator reaches out when something matches.
          </p>
        </div>
        <div className="rounded-[14px] border border-line-subtle bg-surface-1 p-7 shadow-lg">
          {state.status === "success" ? (
            <div className="px-3 py-10 text-center">
              <div className="mx-auto mb-[18px] flex h-[52px] w-[52px] items-center justify-center rounded-full border border-lime-500 bg-lime-500/12 shadow-glow-lime">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="stroke-lime-400"
                >
                  <title>Enviado</title>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <div className="mb-1.5 font-display text-[20px] font-semibold text-fg-strong">
                Você está na lista.
              </div>
              <div className="font-ui text-[14px] text-fg-muted">
                Um curador entra em contato em breve.
              </div>
            </div>
          ) : (
            <form action={formAction} className="flex flex-col gap-4">
              <Input
                name="name"
                label="Nome"
                placeholder="Seu nome"
                required
                error={fieldErrors?.name?.[0]}
              />
              <Input
                name="phone"
                label="Telefone"
                type="tel"
                placeholder="(11) 99999-9999"
                required
                error={fieldErrors?.phone?.[0]}
              />
              <Select
                name="skinId"
                label="Skin de interesse"
                options={skinOptions}
                required
                error={fieldErrors?.skinId?.[0]}
              />
              {state.status === "error" && (
                <p className="font-ui text-body-sm text-danger">
                  {state.message}
                </p>
              )}
              <Button type="submit" size="lg" fullWidth disabled={pending}>
                {pending ? "Enviando…" : "Solicitar acesso"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
