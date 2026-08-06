"use client";

import { useState } from "react";
import { Select } from "@/components/ui/forms/Select";
import { TradingCard } from "@/components/ui/surfaces/TradingCard";

export type DropCard = {
  id: string;
  /** DJ name, shown as the card's main title. */
  name: string;
  /** Card name, shown as the card's alias line. */
  alias: string;
  price: number;
  artUrl?: string | null;
  cardNumber: string;
  rarity: "common" | "rare" | "epic" | "legendary";
};

const RARITY_OPTIONS = [
  { value: "all", label: "Todas as raridades" },
  { value: "common", label: "Comum" },
  { value: "rare", label: "Raro" },
  { value: "epic", label: "Épico" },
  { value: "legendary", label: "Lendário" },
];

export function DropsGrid({ cards }: { cards: DropCard[] }) {
  const [filter, setFilter] = useState("all");
  const shown =
    filter === "all" ? cards : cards.filter((card) => card.rarity === filter);

  return (
    <section id="drops" className="scroll-mt-16 px-5 pt-10 pb-20 sm:px-10">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 font-mono text-caption uppercase tracking-label text-magenta-400">
            Destaques da semana
          </div>
          <h2 className="font-display text-h2 font-bold tracking-heading text-fg-strong">
            CARDS
          </h2>
        </div>
        <div className="w-full sm:w-[200px]">
          <Select
            aria-label="Filtrar por raridade"
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
