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

const RARITY_LABEL: Record<string, string> = {
  LEGENDARY: "Lendária",
  EPIC: "Épica",
  RARE: "Rara",
};

const RARITY_PRICE: Record<string, string> = {
  LEGENDARY: "89.90",
  EPIC: "59.90",
  RARE: "39.90",
};

function djEntry(name: string, file: string, rarity: string) {
  return {
    name,
    imageUrl: `/djs/${file}`,
    bio: null,
    cards: [
      {
        name: `Edição ${RARITY_LABEL[rarity]}`,
        price: RARITY_PRICE[rarity],
        imageUrl: `/djs/${file}`,
        rarity,
      },
    ],
  };
}

const DJS = [
  djEntry("David Guetta", "guetta.jpeg", "LEGENDARY"),
  djEntry("Swedish House Mafia", "shm.jpeg", "LEGENDARY"),
  djEntry("Charlotte de Witte", "charlotte.jpeg", "EPIC"),
  djEntry("Boris Brejcha", "boris.jpeg", "EPIC"),
  djEntry("Vintage Culture", "vintage.jpeg", "EPIC"),
  djEntry("ARTBAT", "artbat.jpeg", "EPIC"),
  djEntry("Alok", "alok.jpeg", "EPIC"),
  djEntry("John Summit", "summit.jpeg", "RARE"),
  djEntry("CamelPhat", "camelphat.png", "RARE"),
  djEntry("Argy", "argy.jpeg", "RARE"),
  djEntry("ANNA", "anna.jpeg", "RARE"),
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

    for (const card of dj.cards) {
      await prisma.card.upsert({
        where: { djId_name: { djId: createdDj.id, name: card.name } },
        update: {
          imageUrl: card.imageUrl,
          price: card.price,
          rarity: card.rarity as Rarity,
        },
        create: {
          djId: createdDj.id,
          name: card.name,
          imageUrl: card.imageUrl,
          price: card.price,
          rarity: card.rarity as Rarity,
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
