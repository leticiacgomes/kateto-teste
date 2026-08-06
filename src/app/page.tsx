import { ContactSection } from "@/components/public/ContactSection";
import { type DropCard, DropsGrid } from "@/components/public/DropsGrid";
import { Footer } from "@/components/public/Footer";
import { Hero } from "@/components/public/Hero";
import { Nav } from "@/components/public/Nav";
import { prisma } from "@/lib/prisma";
import { cardRepository } from "@/repositories/card.repository";

export default async function Home() {
  const dbCards = await cardRepository.listWithDj(prisma);

  const cards: DropCard[] = dbCards.map((card, index) => ({
    id: card.id,
    name: card.dj.name,
    alias: card.name,
    price: Number(card.price),
    artUrl: card.imageUrl,
    cardNumber: String(index + 1).padStart(3, "0"),
    rarity: card.rarity.toLowerCase() as DropCard["rarity"],
  }));

  const cardOptions = dbCards.map((card) => ({
    value: card.id,
    label: `${card.dj.name} — ${card.name}`,
  }));

  const rarityRank: Record<DropCard["rarity"], number> = {
    legendary: 4,
    epic: 3,
    rare: 2,
    common: 1,
  };
  const heroCards = [...cards]
    .sort((a, b) => rarityRank[b.rarity] - rarityRank[a.rarity])
    .slice(0, 4);

  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <Hero cards={heroCards} />
      <DropsGrid cards={cards} />
      <ContactSection cardOptions={cardOptions} />
      <Footer />
    </div>
  );
}
