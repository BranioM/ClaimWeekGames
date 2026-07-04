-- Preserve existing platform data while renaming the concept to Store.
ALTER TABLE "Platform" RENAME TO "Store";
ALTER INDEX "Platform_name_key" RENAME TO "Store_name_key";
ALTER TABLE "Store" RENAME CONSTRAINT "Platform_pkey" TO "Store_pkey";

ALTER TABLE "ConnectedAccount" RENAME COLUMN "platformId" TO "storeId";
ALTER TABLE "AccountConnectionState" RENAME COLUMN "platformId" TO "storeId";
ALTER TABLE "ExternalGameId" RENAME COLUMN "platformId" TO "storeId";
ALTER TABLE "FreeGameOffer" RENAME COLUMN "platformId" TO "storeId";

ALTER TABLE "ConnectedAccount" RENAME CONSTRAINT "ConnectedAccount_platformId_fkey" TO "ConnectedAccount_storeId_fkey";
ALTER TABLE "AccountConnectionState" RENAME CONSTRAINT "AccountConnectionState_platformId_fkey" TO "AccountConnectionState_storeId_fkey";
ALTER TABLE "ExternalGameId" RENAME CONSTRAINT "ExternalGameId_platformId_fkey" TO "ExternalGameId_storeId_fkey";
ALTER TABLE "FreeGameOffer" RENAME CONSTRAINT "FreeGameOffer_platformId_fkey" TO "FreeGameOffer_storeId_fkey";

ALTER TABLE "ConnectedAccount" DROP CONSTRAINT "ConnectedAccount_storeId_fkey";
ALTER TABLE "AccountConnectionState" DROP CONSTRAINT "AccountConnectionState_storeId_fkey";
ALTER TABLE "ExternalGameId" DROP CONSTRAINT "ExternalGameId_storeId_fkey";
ALTER TABLE "FreeGameOffer" DROP CONSTRAINT "FreeGameOffer_storeId_fkey";

DROP INDEX "ConnectedAccount_userId_platformId_accountKey_key";
DROP INDEX "ConnectedAccount_platformId_externalAccountId_key";
DROP INDEX "AccountConnectionState_userId_platformId_consumedAt_expiresAt_idx";
DROP INDEX "ExternalGameId_platformId_providerGameId_key";
DROP INDEX "FreeGameOffer_platformId_externalOfferId_key";
DROP INDEX "FreeGameOffer_gameId_platformId_startDate_endDate_key";

CREATE UNIQUE INDEX "ConnectedAccount_userId_storeId_accountKey_key" ON "ConnectedAccount"("userId", "storeId", "accountKey");
CREATE UNIQUE INDEX "ConnectedAccount_storeId_externalAccountId_key" ON "ConnectedAccount"("storeId", "externalAccountId");
CREATE INDEX "AccountConnectionState_userId_storeId_consumedAt_expiresAt_idx" ON "AccountConnectionState"("userId", "storeId", "consumedAt", "expiresAt");
CREATE UNIQUE INDEX "ExternalGameId_storeId_providerGameId_key" ON "ExternalGameId"("storeId", "providerGameId");
CREATE UNIQUE INDEX "FreeGameOffer_storeId_externalOfferId_key" ON "FreeGameOffer"("storeId", "externalOfferId");
CREATE UNIQUE INDEX "FreeGameOffer_gameId_storeId_startDate_endDate_key" ON "FreeGameOffer"("gameId", "storeId", "startDate", "endDate");

ALTER TABLE "ConnectedAccount" ADD CONSTRAINT "ConnectedAccount_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AccountConnectionState" ADD CONSTRAINT "AccountConnectionState_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExternalGameId" ADD CONSTRAINT "ExternalGameId_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FreeGameOffer" ADD CONSTRAINT "FreeGameOffer_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TYPE "SyncJobStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED');

CREATE TABLE "SyncJob" (
    "id" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" "SyncJobStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "storeId" TEXT,

    CONSTRAINT "SyncJob_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SyncJob_status_createdAt_idx" ON "SyncJob"("status", "createdAt");
CREATE INDEX "SyncJob_storeId_jobType_createdAt_idx" ON "SyncJob"("storeId", "jobType", "createdAt");

ALTER TABLE "SyncJob" ADD CONSTRAINT "SyncJob_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
