import { cn } from "@/lib/cn";
import { RarityBadge, type RarityTier } from "../display/RarityBadge";

const rarityClasses = {
  common: {
    bg: "bg-[color-mix(in_srgb,var(--color-rarity-common)_45%,var(--color-ink-700))]",
    hoverShadow:
      "hover:shadow-[0_0_0_1px_var(--color-rarity-common),0_0_26px_color-mix(in_srgb,var(--color-rarity-common)_45%,transparent),var(--shadow-lg)]",
    artGlow:
      "bg-[radial-gradient(120%_80%_at_30%_10%,color-mix(in_srgb,var(--color-rarity-common)_40%,transparent),transparent_60%),linear-gradient(160deg,var(--color-ink-750),var(--color-ink-900))]",
    text: "text-rarity-common",
  },
  rare: {
    bg: "bg-[color-mix(in_srgb,var(--color-rarity-rare)_45%,var(--color-ink-700))]",
    hoverShadow:
      "hover:shadow-[0_0_0_1px_var(--color-rarity-rare),0_0_26px_color-mix(in_srgb,var(--color-rarity-rare)_45%,transparent),var(--shadow-lg)]",
    artGlow:
      "bg-[radial-gradient(120%_80%_at_30%_10%,color-mix(in_srgb,var(--color-rarity-rare)_40%,transparent),transparent_60%),linear-gradient(160deg,var(--color-ink-750),var(--color-ink-900))]",
    text: "text-rarity-rare",
  },
  epic: {
    bg: "bg-[color-mix(in_srgb,var(--color-rarity-epic)_45%,var(--color-ink-700))]",
    hoverShadow:
      "hover:shadow-[0_0_0_1px_var(--color-rarity-epic),0_0_26px_color-mix(in_srgb,var(--color-rarity-epic)_45%,transparent),var(--shadow-lg)]",
    artGlow:
      "bg-[radial-gradient(120%_80%_at_30%_10%,color-mix(in_srgb,var(--color-rarity-epic)_40%,transparent),transparent_60%),linear-gradient(160deg,var(--color-ink-750),var(--color-ink-900))]",
    text: "text-rarity-epic",
  },
  legendary: {
    bg: "bg-[color-mix(in_srgb,var(--color-rarity-legendary)_45%,var(--color-ink-700))]",
    hoverShadow:
      "hover:shadow-[0_0_0_1px_var(--color-rarity-legendary),0_0_26px_color-mix(in_srgb,var(--color-rarity-legendary)_45%,transparent),var(--shadow-lg)]",
    artGlow:
      "bg-[radial-gradient(120%_80%_at_30%_10%,color-mix(in_srgb,var(--color-rarity-legendary)_40%,transparent),transparent_60%),linear-gradient(160deg,var(--color-ink-750),var(--color-ink-900))]",
    text: "text-rarity-legendary",
  },
};

export type TradingCardProps = {
  name?: string;
  alias?: string;
  rarity?: RarityTier;
  genre?: string;
  cardNumber?: string | number;
  price?: number | string;
  artUrl?: string;
  foil?: boolean;
  onClick?: () => void;
  className?: string;
};

/**
 * The signature Dropbase DJ trading card. The art area is a placeholder surface — pass `artUrl`
 * to drop in real cover art. Legendary cards carry the foil frame + sheen.
 */
export function TradingCard(props: TradingCardProps) {
  const {
    name = "Unknown Artist",
    alias,
    rarity = "common",
    genre,
    cardNumber,
    price,
    artUrl,
    foil,
    onClick,
    className,
  } = props;
  const r = rarityClasses[rarity] || rarityClasses.common;
  const isFoil = foil ?? rarity === "legendary";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative block w-[260px] rounded-card p-[3px] text-left text-inherit",
        isFoil ? "bg-[image:var(--foil-sheen)]" : r.bg,
        onClick ? "cursor-pointer" : "cursor-default",
        "shadow-md hover:-translate-y-1",
        r.hoverShadow,
        "transition-[transform,box-shadow] duration-[140ms] ease-standard",
        className,
      )}
    >
      <div className="flex flex-col overflow-hidden rounded-[calc(var(--radius-card)-2px)] bg-surface-1">
        {/* Art */}
        <div
          className={cn(
            "relative aspect-[4/3] border-b border-line-subtle",
            artUrl ? "bg-cover bg-center bg-no-repeat" : r.artGlow,
          )}
          style={artUrl ? { backgroundImage: `url(${artUrl})` } : undefined}
        >
          <div className="absolute top-2.5 left-2.5">
            <RarityBadge tier={rarity} size="sm" />
          </div>
          {cardNumber && (
            <span className="absolute top-3 right-3 font-mono text-micro tracking-mono text-fg-faint">
              #{cardNumber}
            </span>
          )}
          {!artUrl && (
            <span className="absolute inset-0 flex items-center justify-center font-mono text-caption text-fg-faint uppercase tracking-label">
              Art
            </span>
          )}
        </div>
        {/* Body */}
        <div className="flex flex-col gap-1 p-4">
          {alias && (
            <span
              className={cn(
                "font-mono text-micro uppercase tracking-label",
                r.text,
              )}
            >
              {alias}
            </span>
          )}
          <span className="font-display text-h4 font-bold leading-snug tracking-heading text-fg-strong">
            {name}
          </span>
          <div className="mt-2 flex items-center justify-between">
            {genre && (
              <span className="font-ui text-body-sm text-fg-muted">
                {genre}
              </span>
            )}
            {price != null && (
              <span className="font-mono text-body font-bold text-fg-strong">
                {typeof price === "number" ? `$${price}` : price}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
