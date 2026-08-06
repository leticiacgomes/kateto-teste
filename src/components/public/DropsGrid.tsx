"use client";

import { useState } from "react";
import { Select } from "@/components/ui/forms/Select.jsx";
import { TradingCard } from "@/components/ui/surfaces/TradingCard.jsx";

export type DropCard = {
  id: string;
  /** DJ name, shown as the card's main title. */
  name: string;
  /** Skin name, shown as the card's alias line. */
  alias: string;
  price: number;
  artUrl?: string | null;
  cardNumber: string;
  rarity: "common" | "rare" | "epic" | "legendary";
};

const RARITY_OPTIONS = ["All rarities", "Common", "Rare", "Epic", "Legendary"];

export function DropsGrid({ cards }: { cards: DropCard[] }) {
  const [filter, setFilter] = useState("All rarities");
  const shown =
    filter === "All rarities"
      ? cards
      : cards.filter((card) => card.rarity === filter.toLowerCase());

  return (
    <section className="px-10 pt-10 pb-20">
      <div className="mb-7 flex items-end justify-between">
        <div>
          <div className="mb-2 font-mono text-[12px] uppercase tracking-label text-magenta-400">
            This week&apos;s crate
          </div>
          <h2 className="font-display text-[34px] font-bold tracking-[-0.02em] text-fg-strong">
            Featured drops
          </h2>
        </div>
        <div className="w-[200px]">
          <Select
            options={RARITY_OPTIONS}
            value={filter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFilter(e.target.value)
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] justify-items-center gap-6">
        {shown.map((card) => (
          <TradingCard
            key={card.id}
            name={card.name}
            alias={card.alias}
            rarity={card.rarity}
            cardNumber={card.cardNumber}
            price={card.price}
            artUrl={card.artUrl ?? undefined}
            className="w-full max-w-[300px]"
          />
        ))}
      </div>
    </section>
  );
}
