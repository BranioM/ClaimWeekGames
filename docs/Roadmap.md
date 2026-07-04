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
- Metadata-only Epic ownership sync persistence.
- Public active free-offer endpoint.
- Internal API-key guard for sync endpoints.
- Internal API-key guarded Epic account connection endpoints.
- Opaque bearer session foundation with hashed `UserSession` records.
- Expanded API e2e coverage for public endpoints, authenticated identity, and internal guard boundaries.

## Next Milestone: Auth and Public API Boundary

Add authenticated API endpoints around the existing internal services.

Scope:

- Add public signup/login or external identity-provider callback.
- Add session revocation endpoint.
- Add user-scoped authorization guards where endpoints access owned records.
- Design user-authenticated account-connection endpoints.
- Keep sync endpoints internal/admin-only as the system grows beyond API-key protection.

## Later Milestones

- Scheduler foundation using Redis-backed jobs or locks.
- Notification events for new free offers.
- Authenticated Epic library retrieval after auth/session design is accepted.
- Web UI for health, free offers, and connected accounts.
- Additional stores: Steam, GOG, Xbox, Amazon Games, Ubisoft Connect, EA App.
- Secure token storage if required, with encryption at rest and key rotation plan.
- GitHub Actions deployment and release workflows.
