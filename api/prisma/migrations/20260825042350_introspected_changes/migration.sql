-- CreateEnum
CREATE TYPE "roletype" AS ENUM ('admin', 'applicant', 'investor');

-- CreateTable
CREATE TABLE "refreshtokens" (
    "refreshtokenid" SERIAL NOT NULL,
    "userid" INTEGER NOT NULL,
    "token" VARCHAR(50) NOT NULL,
    "createdat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "active" SMALLINT,

    CONSTRAINT "refreshtokens_pkey" PRIMARY KEY ("refreshtokenid")
);

-- CreateTable
CREATE TABLE "users" (
    "userid" SERIAL NOT NULL,
    "email" VARCHAR(40) NOT NULL,
    "password" VARCHAR(50) NOT NULL,
    "role" "roletype" NOT NULL DEFAULT 'applicant',
    "passwordrecoverytoken" VARCHAR(40),
    "passwordrecoveryexpires" TIMESTAMPTZ[],
    "active" SMALLINT DEFAULT 1,
    "createdat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("userid")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "refreshtokens" ADD CONSTRAINT "fk_users_userid" FOREIGN KEY ("userid") REFERENCES "users"("userid") ON DELETE NO ACTION ON UPDATE NO ACTION;
