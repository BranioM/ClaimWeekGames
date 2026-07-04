-- CreateTable
CREATE TABLE "ExternalGameId" (
    "id" TEXT NOT NULL,
    "providerGameId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gameId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,

    CONSTRAINT "ExternalGameId_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectedAccount" (
    "id" TEXT NOT NULL,
    "accountKey" TEXT NOT NULL,
    "externalAccountId" TEXT,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,

    CONSTRAINT "ConnectedAccount_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "FreeGameOffer" ADD COLUMN "externalOfferId" TEXT;

-- AlterTable
ALTER TABLE "Ownership" ADD COLUMN "connectedAccountId" TEXT;

-- Backfill a default connected account for each existing user/platform ownership pair.
INSERT INTO "ConnectedAccount" (
    "id",
    "accountKey",
    "displayName",
    "createdAt",
    "updatedAt",
    "userId",
    "platformId"
)
SELECT
    'connected_' || md5("userId" || ':' || "platformId"),
    'default',
    'Default account',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    "userId",
    "platformId"
FROM "Ownership"
GROUP BY "userId", "platformId";

-- Link existing ownership rows to the backfilled connected accounts.
UPDATE "Ownership"
SET "connectedAccountId" = 'connected_' || md5("userId" || ':' || "platformId")
WHERE "connectedAccountId" IS NULL;

-- DropForeignKey
ALTER TABLE "Ownership" DROP CONSTRAINT "Ownership_platformId_fkey";

-- DropForeignKey
ALTER TABLE "Ownership" DROP CONSTRAINT "Ownership_userId_fkey";

-- DropIndex
DROP INDEX "Ownership_userId_gameId_platformId_key";

-- AlterTable
ALTER TABLE "Ownership" ALTER COLUMN "connectedAccountId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Ownership" DROP COLUMN "userId", DROP COLUMN "platformId";

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedAccount_userId_platformId_accountKey_key" ON "ConnectedAccount"("userId", "platformId", "accountKey");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedAccount_platformId_externalAccountId_key" ON "ConnectedAccount"("platformId", "externalAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalGameId_platformId_providerGameId_key" ON "ExternalGameId"("platformId", "providerGameId");

-- CreateIndex
CREATE UNIQUE INDEX "FreeGameOffer_platformId_externalOfferId_key" ON "FreeGameOffer"("platformId", "externalOfferId");

-- CreateIndex
CREATE UNIQUE INDEX "FreeGameOffer_gameId_platformId_startDate_endDate_key" ON "FreeGameOffer"("gameId", "platformId", "startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "Ownership_connectedAccountId_gameId_key" ON "Ownership"("connectedAccountId", "gameId");

-- AddForeignKey
ALTER TABLE "ConnectedAccount" ADD CONSTRAINT "ConnectedAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectedAccount" ADD CONSTRAINT "ConnectedAccount_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalGameId" ADD CONSTRAINT "ExternalGameId_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalGameId" ADD CONSTRAINT "ExternalGameId_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ownership" ADD CONSTRAINT "Ownership_connectedAccountId_fkey" FOREIGN KEY ("connectedAccountId") REFERENCES "ConnectedAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
