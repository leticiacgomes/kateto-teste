"use client";

import { Badge } from "@/components/ui/display/Badge";
import { Button } from "@/components/ui/forms/Button";

function scrollToContact() {
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
}

export function Hero() {
  return (
    <section className="relative overflow-hidden px-10 pt-24 pb-18 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(255,47,208,0.18),transparent_70%)]" />
      <div className="relative mx-auto max-w-[820px]">
        <div className="mb-[22px]">
          <Badge tone="magenta">EXCLUSIVO · EDIÇÃO LIMITADA</Badge>
        </div>
        <h1 className="mb-5 font-display text-[66px] leading-[1.02] font-bold tracking-[-0.035em] text-fg-strong">
          Os cards que eternizam
          <br />
          os maiores nomes da música eletrônica.
        </h1>
        <p className="mx-auto mb-[34px] max-w-[560px] font-ui text-[18px] leading-[1.55] text-fg-muted">
          Uma coleção exclusiva para quem vive a energia das pistas, festivais e
          dos grandes artistas.
        </p>
        <div className="flex justify-center gap-3.5">
          <Button size="lg" onClick={scrollToContact}>
            QUERO MEU CARD
          </Button>
        </div>
      </div>
    </section>
  );
}
