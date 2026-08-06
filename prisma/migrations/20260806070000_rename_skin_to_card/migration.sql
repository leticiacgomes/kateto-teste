-- Rename table "Skin" -> "Card" (and its constraints/indexes), preserving data.
ALTER TABLE "Skin" RENAME TO "Card";
ALTER TABLE "Card" RENAME CONSTRAINT "Skin_pkey" TO "Card_pkey";
ALTER TABLE "Card" RENAME CONSTRAINT "Skin_djId_fkey" TO "Card_djId_fkey";
ALTER INDEX "Skin_djId_idx" RENAME TO "Card_djId_idx";
ALTER INDEX "Skin_djId_name_key" RENAME TO "Card_djId_name_key";

-- Rename "Lead"."skinId" -> "Lead"."cardId" (and its constraint/index), preserving data.
ALTER TABLE "Lead" RENAME COLUMN "skinId" TO "cardId";
ALTER TABLE "Lead" RENAME CONSTRAINT "Lead_skinId_fkey" TO "Lead_cardId_fkey";
ALTER INDEX "Lead_skinId_idx" RENAME TO "Lead_cardId_idx";
