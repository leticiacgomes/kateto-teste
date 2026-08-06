"use client";

import { useActionState } from "react";
import { createLeadAction } from "@/actions/lead.actions";
import { Button } from "@/components/ui/forms/Button";
import { Input } from "@/components/ui/forms/Input";
import { Select } from "@/components/ui/forms/Select";

export type SkinOption = { value: string; label: string };

export function ContactSection({ skinOptions }: { skinOptions: SkinOption[] }) {
  const [state, formAction, pending] = useActionState(createLeadAction, {});
  const fieldErrors = state.validationErrors?.fieldErrors;
  const success = Boolean(state.data?.success);

  return (
    <section
      id="contact"
      className="scroll-mt-16 border-t border-line-subtle bg-surface-app-deep px-5 py-14 sm:px-10 sm:py-20"
    >
      <div className="mx-auto grid max-w-[1000px] grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
        <div>
          <div className="mb-3 font-mono text-caption uppercase tracking-label text-magenta-400">
            ESCOLHA O SEU PREFERIDO
          </div>
          <h2 className="mb-4 font-display text-h3 leading-tight font-bold tracking-heading text-fg-strong sm:text-h2">
            Qual card você procura?
          </h2>
          <p className="font-ui text-body leading-relaxed text-fg-muted">
            Preencha seus dados e informe qual raridade você deseja adquirir.
            Nossa equipe entratá em contato para dar continuidade :)
          </p>
        </div>
        <div className="rounded-card border border-line-subtle bg-surface-1 p-7 shadow-lg">
          {success ? (
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
              <div className="mb-1.5 font-display text-h4 font-semibold text-fg-strong">
                Você está na lista.
              </div>
              <div className="font-ui text-body text-fg-muted">
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
                label="Card de interesse"
                options={skinOptions}
                required
                error={fieldErrors?.skinId?.[0]}
              />
              {state.serverError && (
                <p className="font-ui text-body-sm text-danger">
                  {state.serverError}
                </p>
              )}
              <Button type="submit" size="lg" fullWidth disabled={pending}>
                {pending ? "Enviando…" : "SOLICITAR COMPRA"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
