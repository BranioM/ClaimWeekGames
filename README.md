# ClaimWeekGames

ClaimWeekGames is an open-source application for tracking, synchronizing, and managing free games and owned games across digital game stores.

The long-term goal is a unified game library where users can see free weekly offers, connected store accounts, and owned games in one place.

## Current Status

The backend foundation is implemented and verified:

- TurboRepo workspace with NestJS API and Next.js web app.
- PostgreSQL and Redis via Docker Compose.
- Prisma 7 configured with additive migrations.
- Health endpoint with database probe.
- Public active free-offer endpoint.
- Internal Epic weekly free-offer sync with `SyncJob` tracking.
- Internal Epic ownership sync endpoint.
- Epic account connection foundation using one-time hashed state values.
- Opaque bearer session foundation using hashed `UserSession` records.
- Store-based domain model for digital game stores.
- `SyncJob` schema for future synchronization tracking.
- API e2e coverage for health, public offers, authenticated identity, and internal guard boundaries.

## Stack

Backend:

- NestJS
- TypeScript
- Prisma
- PostgreSQL
- Redis

Frontend:

- Next.js
- React
- TypeScript

Infrastructure:

- Docker
- Docker Compose
- GitHub Actions
- npm workspaces
- TurboRepo

## Repository Layout

```text
apps/
  api/        NestJS API
  web/        Next.js web app
docs/         Architecture, API, database, roadmap, status, security, decisions
packages/     Shared workspace packages
```

## Local Development

Start infrastructure:

```sh
docker compose up -d
```

Install dependencies:

```sh
npm install
```

Apply database migrations:

```sh
cd apps/api
npx prisma migrate deploy
```

Run the API in development mode:

```sh
PORT=3002 npm run start:dev --workspace api
```

Check health:

```sh
curl http://localhost:3002/api/health
```

Expected response shape:

```json
{
  "status": "ok",
  "database": "ok",
  "timestamp": "2026-07-04T17:00:57.246Z"
}
```

## Verification

Before considering a backend change complete, run:

```sh
npm run build
npm run lint --workspace api
npm test --workspace api
npm run test:e2e --workspace api
```

Database checks:

```sh
cd apps/api
npx prisma validate
npx prisma migrate status
```

## Documentation

Maintained project documents:

- `AGENTS.md` describes how agents should work on the project.
- `docs/architecture.md` describes system design, modules, data model, and synchronization flow.
- `docs/API.md` describes public and internal API contracts.
- `docs/database.md` describes Prisma schema relationships and migration policy.
- `docs/security.md` describes the current security posture and open risks.
- `docs/Roadmap.md` describes planned milestones.
- `docs/ProjectStatus.md` describes current capabilities and verification status.
- `docs/Decisions.md` records architecture and security decisions.

## Architecture Summary

The backend uses modular NestJS architecture. Controllers stay thin, business logic lives in services, and database access goes through Prisma.

Current backend modules:

- `DatabaseModule`
- `HealthModule`
- `AuthModule`
- `SecurityModule`
- `FreeOffersModule`
- `EpicAccountsModule`
- `EpicGamesModule`

Epic Games is the first store integration. Future integrations should follow the same module pattern for Steam, GOG, Xbox, Amazon Games, Ubisoft Connect, and EA App.

## Security Summary

ClaimWeekGames currently avoids credential custody:

- No Epic passwords are stored.
- No Epic tokens are stored.
- Account connection state is hashed, one-time-use, and expiring.
- Session tokens are stored only as hashes.
- Internal mutation endpoints require `x-api-key` and `INTERNAL_API_KEY`.
- User endpoints require opaque bearer sessions.

See `docs/security.md` for the full security posture.
