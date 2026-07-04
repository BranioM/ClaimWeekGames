# API

## Current HTTP Surface

Base prefix: `/api`

### `GET /api/health`

Returns API and database health.

Example response:

```json
{
  "status": "ok",
  "database": "ok",
  "timestamp": "2026-07-04T10:04:53.038Z"
}
```

## Internal Services

### `PrismaService`

Owns Prisma client lifecycle and PostgreSQL adapter configuration.

### `HealthService`

Runs a database probe with `SELECT 1`.

### `EpicGamesClientService`

Fetches and normalizes Epic free-game promotions.

Security constraints:

- HTTPS only.
- Allowed Epic promotion hosts only.
- 10-second request timeout.
- Defensive parsing of untrusted JSON.

### `EpicGamesSyncService`

Persists Epic free offers into:

- `Platform`
- `Game`
- `ExternalGameId`
- `FreeGameOffer`

### `EpicGamesCheckoutService`

Generates user-assisted Epic checkout URLs from normalized free offers.

### `EpicAccountConnectionService`

Creates and consumes one-time account connection state values.

Security constraints:

- raw state value is returned once and never persisted.
- SHA-256 state hash is persisted.
- state expires after 10 minutes.
- state can be consumed only once.

## Planned HTTP Surface

- `POST /api/epic/accounts/connection-state`
- `POST /api/epic/accounts/connect`
- `GET /api/free-offers`
- `POST /api/sync/epic/free-offers` for internal/admin use only
