# Project Status

## Branch

`feature/database`

## Latest Completed Commits

- `2b79eaf test: cover scheduled Epic sync failure`
- `ffdb906 feat: schedule Epic free-offer sync`
- `72e83af feat: harden Epic free-offer sync`
- `b1dcc29 feat: implement Epic weekly free-offer sync`
- `c22a9fd feat: add PlayPlatform and security baseline`
- `4eb9868 refactor: rename Platform to Store`

## Current Capabilities

- API starts in development mode.
- `/api/health` returns API and database health.
- Prisma migrations are applied locally.
- Epic weekly free-game offers can be fetched, normalized, persisted, and tracked with `SyncJob`.
- Epic sync records source, timing, duration, and creation/update counters in `SyncJob.metadata`.
- Epic weekly free-offer sync is scheduled through Redis-backed BullMQ every Thursday at 18:00 Europe/Bratislava time by default.
- Scheduled Epic sync can be configured with `EPIC_FREE_OFFERS_SYNC_ENABLED`, `EPIC_FREE_OFFERS_SYNC_CRON`, and `EPIC_FREE_OFFERS_SYNC_TIMEZONE`.
- Scheduled Epic sync retries up to 3 times with exponential backoff and logs sanitized failures before BullMQ retry handling.
- Internal recent sync-job reads are available at `GET /api/internal/sync-jobs` with status, job type, store, and limit filters.
- Epic account connection state can be generated and consumed without storing raw state, passwords, or tokens.
- Epic owned-game metadata can be persisted for an active connected account.
- User-assisted Epic checkout URLs can be generated from free offers.
- Public active free-offer reads are available at `GET /api/free-offers`.
- Authenticated user identity reads are available at `GET /api/me`.
- Opaque session tokens are stored only as hashes in `UserSession`.
- `Store` is the canonical domain model for digital game stores.
- `PlayPlatform` schema exists as a future playable platform catalog.
- `SyncJob` schema exists for future scheduled synchronization tracking by store and connected account.
- Internal Epic sync and account-connection endpoints are guarded by `x-api-key` and `INTERNAL_API_KEY`.
- Internal session bootstrap is guarded by `x-api-key` and `INTERNAL_API_KEY`.
- E2E tests cover health, public offers, authenticated user identity, and internal guard boundaries.
- GitHub Actions CI validates pull requests.

## Verification Baseline

Last verified commands:

- `npx prisma validate`
- `npm run build --workspace api`
- `npm run lint --workspace api`
- `npm test --workspace api`
- `npx prisma migrate deploy`
- `npm run test:e2e --workspace api`
- `npx prisma migrate status`
- `npm run build`
- `npm run build --workspace api`
- `npm run start:dev --workspace api`
- `curl http://localhost:3001/api/health`
- `curl http://localhost:3001/api/free-offers`
- unauthenticated `POST /api/internal/epic/sync/free-offers` returns `401`
- authenticated e2e `POST /api/internal/epic/sync/free-offers` creates a successful sync response
- e2e `GET /api/internal/sync-jobs` requires the internal API key
- unit tests verify scheduled registration is skipped in tests unless explicitly enabled
- unauthenticated `GET /api/me` returns `401`
- authenticated internal session bootstrap with invalid body reaches validation and returns `400`

## Open Work

- Production scheduler operations: queue dashboard, alerting, and dead-letter handling.
- Cluster-safe scheduler deployment policy so only intended API/worker processes register repeatable jobs.
- Public signup/login or external identity-provider callback.
- Session revocation endpoint.
- Public user-authenticated account connection endpoints using `AuthenticatedUserGuard`.
- Authenticated Epic library retrieval.
- Web UI.
- Notification event pipeline.
