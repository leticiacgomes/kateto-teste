import { cn } from "@/lib/cn";

const tierClasses = {
  common: {
    label: "Comum",
    badge: "bg-rarity-common/14 text-rarity-common border-rarity-common/55",
    dot: "bg-rarity-common shadow-[0_0_8px_var(--color-rarity-common)]",
  },
  rare: {
    label: "Raro",
    badge: "bg-rarity-rare/14 text-rarity-rare border-rarity-rare/55",
    dot: "bg-rarity-rare shadow-[0_0_8px_var(--color-rarity-rare)]",
  },
  epic: {
    label: "Épico",
    badge: "bg-rarity-epic/14 text-rarity-epic border-rarity-epic/55",
    dot: "bg-rarity-epic shadow-[0_0_8px_var(--color-rarity-epic)]",
  },
  legendary: {
    label: "Lendário",
    badge:
      "bg-[image:var(--foil-sheen)] text-ink-950 border-transparent shadow-[0_0_16px_rgba(245,197,66,0.4)]",
    dot: "bg-ink-950",
  },
};

export type RarityTier = keyof typeof tierClasses;

export type RarityBadgeProps = {
  tier?: RarityTier;
  size?: "sm" | "md";
  className?: string;
};

export function RarityBadge(props: RarityBadgeProps) {
  const { tier = "common", size = "md", className } = props;
  const t = tierClasses[tier] || tierClasses.common;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xs border",
        "font-mono font-bold uppercase leading-none tracking-label",
        size === "sm"
          ? "px-2 py-[3px] text-micro"
          : "px-[11px] py-1 text-caption",
        t.badge,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
      {t.label}
    </span>
  );
}
