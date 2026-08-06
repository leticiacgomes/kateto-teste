import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "../generated/prisma/client";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Ordem fixa do round robin, definida em CLAUDE.md.
const REPRESENTATIVES = ["Marcelo", "Rafael", "Renato", "Pedro", "Leonardo"];

const DJS = [
  {
    name: "DJ Nova",
    imageUrl: "https://placehold.co/600x600?text=DJ+Nova",
    bio: "Progressive house e sets de peso para grandes festivais.",
    skins: [
      {
        name: "Nova Neon",
        price: "39.90",
        imageUrl: "https://placehold.co/400x400?text=Nova+Neon",
      },
      {
        name: "Nova Eclipse",
        price: "44.90",
        imageUrl: "https://placehold.co/400x400?text=Nova+Eclipse",
      },
    ],
  },
  {
    name: "Voltz",
    imageUrl: "https://placehold.co/600x600?text=Voltz",
    bio: "Techno underground direto da pista.",
    skins: [
      {
        name: "Voltz Circuito",
        price: "34.90",
        imageUrl: "https://placehold.co/400x400?text=Voltz+Circuito",
      },
      {
        name: "Voltz Blackout",
        price: "34.90",
        imageUrl: "https://placehold.co/400x400?text=Voltz+Blackout",
      },
    ],
  },
  {
    name: "Prisma",
    imageUrl: "https://placehold.co/600x600?text=Prisma",
    bio: "Trance melódico com identidade visual marcante.",
    skins: [
      {
        name: "Prisma Aurora",
        price: "42.90",
        imageUrl: "https://placehold.co/400x400?text=Prisma+Aurora",
      },
      {
        name: "Prisma Refração",
        price: "42.90",
        imageUrl: "https://placehold.co/400x400?text=Prisma+Refracao",
      },
    ],
  },
];

async function main() {
  for (const [index, name] of REPRESENTATIVES.entries()) {
    await prisma.representative.upsert({
      where: { order: index },
      update: { name },
      create: { name, order: index },
    });
  }

  await prisma.roundRobinState.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, nextIndex: 0 },
  });

  for (const dj of DJS) {
    await prisma.dj.upsert({
      where: { name: dj.name },
      update: {},
      create: {
        name: dj.name,
        imageUrl: dj.imageUrl,
        bio: dj.bio,
        skins: {
          create: dj.skins.map((skin) => ({
            name: skin.name,
            imageUrl: skin.imageUrl,
            price: skin.price,
          })),
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
