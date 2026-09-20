/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `refreshtokens` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "refreshtokens" DROP COLUMN "expiresAt",
ADD COLUMN     "expiresat" TIMESTAMPTZ;
