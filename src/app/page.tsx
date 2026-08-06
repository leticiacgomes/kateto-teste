import { ContactSection } from "@/components/public/ContactSection";
import { type DropCard, DropsGrid } from "@/components/public/DropsGrid";
import { Footer } from "@/components/public/Footer";
import { Hero } from "@/components/public/Hero";
import { Nav } from "@/components/public/Nav";
import { prisma } from "@/lib/prisma";
import { skinRepository } from "@/repositories/skin.repository";

export default async function Home() {
  const skins = await skinRepository.listWithDj(prisma);

  const cards: DropCard[] = skins.map((skin, index) => ({
    id: skin.id,
    name: skin.dj.name,
    alias: skin.name,
    price: Number(skin.price),
    artUrl: skin.imageUrl,
    cardNumber: String(index + 1).padStart(3, "0"),
    rarity: skin.rarity.toLowerCase() as DropCard["rarity"],
  }));

  const skinOptions = skins.map((skin) => ({
    value: skin.id,
    label: `${skin.dj.name} — ${skin.name}`,
  }));

  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <Hero />
      <DropsGrid cards={cards} />
      <ContactSection skinOptions={skinOptions} />
      <Footer />
    </div>
  );
}
