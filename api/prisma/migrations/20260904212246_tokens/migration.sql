-- AlterTable
ALTER TABLE "refreshtokens" ALTER COLUMN "token" SET DATA TYPE VARCHAR(400);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "passwordrecoverytoken" SET DATA TYPE VARCHAR(400);
