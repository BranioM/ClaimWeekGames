-- CreateEnum
CREATE TYPE "ConnectedAccountStatus" AS ENUM ('PENDING', 'ACTIVE', 'DISCONNECTED', 'REVOKED');

-- AlterTable
ALTER TABLE "ConnectedAccount" ADD COLUMN "status" "ConnectedAccountStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN "disconnectedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AccountConnectionState" (
    "id" TEXT NOT NULL,
    "stateHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,

    CONSTRAINT "AccountConnectionState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountConnectionState_stateHash_key" ON "AccountConnectionState"("stateHash");

-- CreateIndex
CREATE INDEX "AccountConnectionState_userId_platformId_consumedAt_expiresAt_idx" ON "AccountConnectionState"("userId", "platformId", "consumedAt", "expiresAt");

-- AddForeignKey
ALTER TABLE "AccountConnectionState" ADD CONSTRAINT "AccountConnectionState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountConnectionState" ADD CONSTRAINT "AccountConnectionState_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
