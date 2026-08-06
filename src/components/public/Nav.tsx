"use client";

import { Button } from "@/components/ui/forms/Button.jsx";

function scrollToContact() {
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
}

export function Nav() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line-subtle bg-surface-app/72 px-10 py-4 backdrop-blur-[14px]">
      <div className="flex items-center gap-10">
        <div className="font-display text-[22px] font-bold tracking-[-0.04em] text-fg-strong">
          dropbase
          <span className="text-brand [text-shadow:0_0_12px_var(--color-magenta-glow)]">
            .
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3.5">
        <Button size="sm" onClick={scrollToContact}>
          Get early access
        </Button>
      </div>
    </header>
  );
}
