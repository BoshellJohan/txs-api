/*
  Warnings:

  - The `passwordrecoveryexpires` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "password" SET DATA TYPE VARCHAR(70),
DROP COLUMN "passwordrecoveryexpires",
ADD COLUMN     "passwordrecoveryexpires" TIMESTAMPTZ;
