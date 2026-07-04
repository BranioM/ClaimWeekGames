# Project Status

## Branch

`feature/database`

## Latest Completed Commits

- `ca10860 feat: add internal Epic account endpoints`
- `2982075 feat: add API boundary for offers and sync`
- `9fc6791 feat: add Epic ownership sync foundation`

## Current Capabilities

- API starts in development mode.
- `/api/health` returns API and database health.
- Prisma migrations are applied locally.
- Epic weekly free-game offers can be fetched, normalized, persisted, and tracked with `SyncJob`.
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
- `PORT=3002 npm run start:dev --workspace api`
- `curl http://localhost:3002/api/health`
- `curl http://localhost:3002/api/free-offers`
- unauthenticated `POST /api/internal/epic/sync/free-offers` returns `401`
- unauthenticated `GET /api/me` returns `401`
- authenticated internal session bootstrap with invalid body reaches validation and returns `400`

## Open Work

- Scheduler module.
- Services that create and execute `SyncJob` records.
- Public signup/login or external identity-provider callback.
- Session revocation endpoint.
- Public user-authenticated account connection endpoints using `AuthenticatedUserGuard`.
- Authenticated Epic library retrieval.
- Web UI.
- Notification event pipeline.
