import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const toneClasses = {
  neutral: {
    tint: "bg-surface-raised text-fg-body border-line-default",
    solid: "bg-fg-body text-ink-950 border-fg-body",
  },
  magenta: {
    tint: "bg-magenta-500/12 text-magenta-400 border-magenta-500/40",
    solid: "bg-magenta-400 text-ink-950 border-magenta-400",
  },
  lime: {
    tint: "bg-lime-500/12 text-lime-400 border-lime-500/40",
    solid: "bg-lime-400 text-ink-950 border-lime-400",
  },
  cyan: {
    tint: "bg-cyan-500/12 text-cyan-400 border-cyan-500/40",
    solid: "bg-cyan-400 text-ink-950 border-cyan-400",
  },
  gold: {
    tint: "bg-gold-500/12 text-gold-400 border-gold-500/40",
    solid: "bg-gold-400 text-ink-950 border-gold-400",
  },
  danger: {
    tint: "bg-danger/12 text-danger border-danger/40",
    solid: "bg-danger text-ink-950 border-danger",
  },
};

export type BadgeTone = keyof typeof toneClasses;

export type BadgeProps = {
  children?: ReactNode;
  tone?: BadgeTone;
  solid?: boolean;
  className?: string;
};

export function Badge(props: BadgeProps) {
  const { children, tone = "neutral", solid = false, className } = props;
  const t = toneClasses[tone] || toneClasses.neutral;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-[9px] py-[3px]",
        "font-mono text-micro font-medium uppercase leading-none tracking-label",
        solid ? t.solid : t.tint,
        className,
      )}
    >
      {children}
    </span>
  );
}
