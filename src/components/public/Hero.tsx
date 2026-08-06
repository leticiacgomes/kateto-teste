import type { DropCard } from "@/components/public/DropsGrid";
import { Badge } from "@/components/ui/display/Badge";
import { ButtonLink } from "@/components/ui/forms/ButtonLink";
import { TradingCard } from "@/components/ui/surfaces/TradingCard";

const STACK_LAYOUT = [
  { x: 0, y: 0, scale: 1, z: 4, opacity: 1 },
  { x: 46, y: -20, scale: 0.97, z: 3, opacity: 0.92 },
  { x: 90, y: -38, scale: 0.94, z: 2, opacity: 0.78 },
  { x: 132, y: -54, scale: 0.91, z: 1, opacity: 0.6 },
];

function HeroCardStack({ cards }: { cards: DropCard[] }) {
  const shown = cards.slice(0, 4);
  if (shown.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-[280px] aspect-[392/499] sm:w-[360px] lg:w-[460px]"
    >
      <div className="absolute top-1/2 left-1/2 h-[499px] w-[392px] origin-center -translate-x-1/2 -translate-y-1/2 scale-[0.714] sm:scale-[0.918] lg:scale-[1.173] [perspective:1400px]">
        <div className="pointer-events-none absolute -inset-x-[4%] -inset-y-[6%] bg-[radial-gradient(50%_55%_at_55%_45%,rgba(255,47,208,0.18),transparent_72%)]" />
        <div className="absolute top-[54px] left-0 [transform-style:preserve-3d] [transform:rotateY(-20deg)_rotateX(4deg)]">
          {shown.map((card, index) => {
            const layout = STACK_LAYOUT[index];
            return (
              <div
                key={card.id}
                className="absolute top-0 left-0"
                style={{
                  zIndex: layout.z,
                  opacity: layout.opacity,
                  transform: `translate(${layout.x}px, ${layout.y}px) scale(${layout.scale})`,
                  filter:
                    index === 0 ? "none" : "saturate(0.9) brightness(0.82)",
                }}
              >
                <TradingCard
                  name={card.name}
                  alias={card.alias}
                  rarity={card.rarity}
                  cardNumber={card.cardNumber}
                  artUrl={card.artUrl ?? undefined}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Hero({ cards = [] }: { cards?: DropCard[] }) {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col justify-center overflow-hidden px-5 py-16 sm:px-10 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(58%_60%_at_68%_22%,rgba(255,47,208,0.18),transparent_70%)]" />
      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div className="text-center lg:text-left">
          <div className="mb-[22px] flex justify-center lg:justify-start">
            <Badge tone="magenta">EXCLUSIVO · EDIÇÃO LIMITADA</Badge>
          </div>
          <h1 className="mb-5 font-display text-h2 leading-tight font-bold tracking-display text-fg-strong sm:text-h1 md:text-display">
            Os cards que eternizam{" "}
            <span className="bg-[image:linear-gradient(96deg,var(--color-brand)_10%,var(--color-cyan-500)_90%)] bg-clip-text text-transparent">
              os maiores nomes da música eletrônica
            </span>
            .
          </h1>
          <p className="mx-auto mb-[34px] max-w-[560px] font-ui text-body-lg leading-relaxed text-fg-muted lg:mx-0">
            Uma coleção exclusiva para quem vive a energia das pistas, festivais
            e dos grandes artistas.
          </p>
          <div className="flex flex-col justify-center gap-3.5 sm:flex-row lg:justify-start">
            <ButtonLink href="#contact" size="lg">
              QUERO MEU CARD
            </ButtonLink>
            <ButtonLink href="#drops" size="lg" variant="secondary">
              Ver catálogo
            </ButtonLink>
          </div>
        </div>
        <HeroCardStack cards={cards} />
      </div>
    </section>
  );
}
