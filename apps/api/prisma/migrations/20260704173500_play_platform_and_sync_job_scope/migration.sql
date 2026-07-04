-- Add a future-ready playable platform catalog without wiring it into game metadata yet.
CREATE TABLE "PlayPlatform" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayPlatform_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlayPlatform_name_key" ON "PlayPlatform"("name");
CREATE UNIQUE INDEX "PlayPlatform_slug_key" ON "PlayPlatform"("slug");

-- Shape SyncJob around store/account scope and a simple error field.
ALTER TABLE "SyncJob" RENAME COLUMN "errorMessage" TO "error";
ALTER TABLE "SyncJob" ADD COLUMN "connectedAccountId" TEXT;

CREATE INDEX "SyncJob_connectedAccountId_status_createdAt_idx" ON "SyncJob"("connectedAccountId", "status", "createdAt");

ALTER TABLE "SyncJob" ADD CONSTRAINT "SyncJob_connectedAccountId_fkey" FOREIGN KEY ("connectedAccountId") REFERENCES "ConnectedAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
