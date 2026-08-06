import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import pg from "pg";
import { PrismaClient, type Rarity } from "../generated/prisma/client";

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
        rarity: "RARE",
      },
      {
        name: "Nova Eclipse",
        price: "44.90",
        imageUrl: "https://placehold.co/400x400?text=Nova+Eclipse",
        rarity: "EPIC",
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
        rarity: "COMMON",
      },
      {
        name: "Voltz Blackout",
        price: "34.90",
        imageUrl: "https://placehold.co/400x400?text=Voltz+Blackout",
        rarity: "RARE",
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
        rarity: "EPIC",
      },
      {
        name: "Prisma Refração",
        price: "42.90",
        imageUrl: "https://placehold.co/400x400?text=Prisma+Refracao",
        rarity: "LEGENDARY",
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

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@dropbase.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "dropbase123";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      name: "Admin",
    },
  });

  for (const dj of DJS) {
    const createdDj = await prisma.dj.upsert({
      where: { name: dj.name },
      update: { imageUrl: dj.imageUrl, bio: dj.bio },
      create: {
        name: dj.name,
        imageUrl: dj.imageUrl,
        bio: dj.bio,
      },
    });

    for (const skin of dj.skins) {
      await prisma.skin.upsert({
        where: { djId_name: { djId: createdDj.id, name: skin.name } },
        update: {
          imageUrl: skin.imageUrl,
          price: skin.price,
          rarity: skin.rarity as Rarity,
        },
        create: {
          djId: createdDj.id,
          name: skin.name,
          imageUrl: skin.imageUrl,
          price: skin.price,
          rarity: skin.rarity as Rarity,
        },
      });
    }
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
