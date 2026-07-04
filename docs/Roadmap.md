# Roadmap

## Current Phase: Backend Foundation

Goal: establish a reliable, secure backend foundation before adding user-facing workflows.

Completed:

- TurboRepo workspace with NestJS API and Next.js web app.
- Docker Compose PostgreSQL and Redis services.
- Prisma 7 PostgreSQL integration.
- Health endpoint with database probe.
- Core data model for users, stores, games, connected accounts, ownership, external IDs, and free offers.
- Epic free-offer synchronization foundation.
- Secure Epic account connection foundation using hashed one-time state.

## Next Milestone: Epic Ownership Sync

Implement metadata-only Epic ownership sync using `ConnectedAccount`.

Scope:

- Add an Epic ownership sync service.
- Upsert owned games into `Game`, `ExternalGameId`, and `Ownership`.
- Update `ConnectedAccount.lastSyncedAt`.
- Avoid storing passwords or long-lived tokens until an explicit secure auth design is accepted.

## Later Milestones

- Scheduler foundation using Redis-backed jobs or locks.
- Notification events for new free offers.
- Web UI for health, free offers, and connected accounts.
- Authenticated user model and session handling.
- Additional stores: Steam, GOG, Xbox, Amazon Games, Ubisoft Connect, EA App.
- Secure token storage if required, with encryption at rest and key rotation plan.
