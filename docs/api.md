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

### `GET /api/free-offers`

Returns active free-game offer records whose `endDate` is greater than or equal to the current time.

Example response:

```json
[
  {
    "id": "offer-id",
    "externalOfferId": "external-offer-id",
    "startDate": "2026-07-01T00:00:00.000Z",
    "endDate": "2026-07-08T00:00:00.000Z",
    "detectedAt": "2026-07-04T00:00:00.000Z",
    "game": {
      "id": "game-id",
      "title": "Example Game",
      "slug": "example-game",
      "developer": "Example Dev",
      "publisher": "Example Publisher"
    },
    "store": {
      "id": "store-id",
      "name": "Epic Games Store"
    }
  }
]
```

### `GET /api/me`

Authenticated endpoint. Requires `Authorization: Bearer <session-token>`.

Returns the current authenticated application user.

Example response:

```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com"
  }
}
```

### `POST /api/internal/auth/sessions`

Internal endpoint. Requires `x-api-key` matching `INTERNAL_API_KEY`.

Creates an opaque bearer session token for an existing user. This endpoint is an internal bootstrap boundary until public signup/login is implemented.

Request body:

```json
{
  "userId": "user-id"
}
```

Example response:

```json
{
  "token": "one-time-session-token",
  "expiresAt": "2026-08-03T00:00:00.000Z",
  "user": {
    "id": "user-id",
    "email": "user@example.com"
  }
}
```

The raw token is returned once and is not stored.

### `POST /api/internal/epic/sync/free-offers`

Internal endpoint. Requires `x-api-key` matching `INTERNAL_API_KEY`.

Runs Epic weekly free-offer synchronization. The endpoint fetches current/upcoming Epic promotions, persists canonical games, external IDs, and free-offer windows, and records the run in `SyncJob`.

The manual endpoint remains available even though the same synchronization is also scheduled automatically through Redis-backed BullMQ.

Example response:

```json
{
  "syncJobId": "sync-job-id",
  "storeId": "store-id",
  "source": "manual",
  "offersSeen": 2,
  "offersSynced": 2,
  "gamesCreated": 2,
  "gamesUpdated": 0,
  "externalIdsCreated": 2,
  "externalIdsUpdated": 0,
  "offersCreated": 1,
  "offersUpdated": 1,
  "checkoutUrl": "https://www.epicgames.com/store/purchase?offers=...",
  "syncedAt": "2026-07-04T00:00:00.000Z",
  "durationMs": 1234
}
```

SyncJob metadata includes:

- `source` (`manual` or `scheduled`)
- `offersSeen`
- `offersSynced`
- `gamesCreated`
- `gamesUpdated`
- `externalIdsCreated`
- `externalIdsUpdated`
- `offersCreated`
- `offersUpdated`
- `startedAt`
- `finishedAt`
- `durationMs`
- `checkoutUrl`

### `GET /api/internal/sync-jobs`

Internal endpoint. Requires `x-api-key` matching `INTERNAL_API_KEY`.

Returns recent synchronization jobs for operational visibility. Results are newest first.

Optional query parameters:

- `status`: one of `PENDING`, `RUNNING`, `SUCCEEDED`, or `FAILED`
- `jobType`: exact job type such as `EPIC_WEEKLY_FREE_OFFERS`
- `store`: store ID or exact store name such as `Epic Games Store`
- `limit`: positive integer, defaults to 50 and caps at 100

Example response:

```json
[
  {
    "id": "sync-job-id",
    "jobType": "EPIC_WEEKLY_FREE_OFFERS",
    "status": "SUCCEEDED",
    "startedAt": "2026-07-04T00:00:00.000Z",
    "finishedAt": "2026-07-04T00:01:00.000Z",
    "metadata": {
      "source": "scheduled",
      "offersSeen": 2,
      "offersSynced": 2,
      "gamesCreated": 2,
      "gamesUpdated": 0,
      "externalIdsCreated": 2,
      "externalIdsUpdated": 0,
      "offersCreated": 1,
      "offersUpdated": 1,
      "durationMs": 1234
    },
    "createdAt": "2026-07-04T00:00:00.000Z",
    "updatedAt": "2026-07-04T00:01:00.000Z",
    "store": {
      "id": "store-id",
      "name": "Epic Games Store"
    }
  }
]
```

### `POST /api/internal/epic/accounts/connection-state`

Internal endpoint. Requires `x-api-key` matching `INTERNAL_API_KEY`.

Creates a one-time Epic account connection state for a user.

Request body:

```json
{
  "userId": "user-id"
}
```

Example response:

```json
{
  "state": "one-time-state-value",
  "expiresAt": "2026-07-04T00:10:00.000Z"
}
```

The raw `state` value is returned once and is not stored.

### `POST /api/internal/epic/accounts/connect`

Internal endpoint. Requires `x-api-key` matching `INTERNAL_API_KEY`.

Consumes a connection state and upserts an Epic connected account.

Request body:

```json
{
  "userId": "user-id",
  "state": "one-time-state-value",
  "externalAccountId": "epic-account-id",
  "displayName": "Epic User"
}
```

### `POST /api/internal/epic/sync/ownerships`

Internal endpoint. Requires `x-api-key` matching `INTERNAL_API_KEY`.

Persists normalized Epic ownership metadata for an active connected account.

Request body:

```json
{
  "connectedAccountId": "connected-account-id",
  "ownedGames": [
    {
      "providerGameId": "epic-game-id",
      "title": "Example Game",
      "slug": "example-game",
      "developer": "Example Dev",
      "publisher": "Example Publisher",
      "acquiredAt": "2026-07-04T00:00:00.000Z"
    }
  ]
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

- `Store`
- `Game`
- `ExternalGameId`
- `FreeGameOffer`
- `SyncJob`

Sync behavior:

- creates a `PENDING` `SyncJob` before fetching Epic data.
- marks the job `RUNNING` with `startedAt`.
- updates the job to `SUCCEEDED` with offer and creation/update counts on success.
- updates the job to `FAILED` with a sanitized `error` on failure.
- uses upserts so repeated weekly sync runs are idempotent for the same offer window.

### `EpicFreeOffersSchedulerService`

Registers a Redis-backed BullMQ repeatable job for Epic weekly free-offer synchronization.

Schedule:

- Queue: `epic-sync`
- Job name: `epic.free-offers.sync`
- Default cron: `0 18 * * 4`
- Default time zone: `Europe/Bratislava`
- Human schedule: every Thursday at 18:00 Europe/Bratislava time
- Retry policy: 3 attempts with exponential backoff starting at 60 seconds
- Retention: keep the latest 100 completed jobs and 500 failed jobs in Redis

Configuration:

- `EPIC_FREE_OFFERS_SYNC_ENABLED=true|false`
- `EPIC_FREE_OFFERS_SYNC_CRON`
- `EPIC_FREE_OFFERS_SYNC_TIMEZONE`

If `EPIC_FREE_OFFERS_SYNC_ENABLED` is not set, registration is enabled outside `test` and `production`. In `NODE_ENV=test`, the API does not import scheduler infrastructure unless `EPIC_FREE_OFFERS_SYNC_ENABLED=true`.

The scheduled job delegates to `EpicGamesSyncService`, so every scheduled run creates and completes or fails a `SyncJob` record in PostgreSQL.

### `EpicFreeOffersProcessor`

Consumes the BullMQ scheduled job and runs Epic free-offer synchronization.

Failure behavior:

- logs the failed BullMQ job ID.
- logs sanitized error messages only.
- rethrows sync failures so BullMQ applies the retry policy.
- relies on `EpicGamesSyncService` to mark the related PostgreSQL `SyncJob` as `FAILED`.

### `SyncJobsService`

Returns recent `SyncJob` records for internal operational visibility.

Security constraints:

- only exposed through `InternalApiKeyGuard`.
- returns status and metadata, not secrets.
- supports status, job type, store, and limit filters.

### `EpicOwnershipSyncService`

Persists normalized Epic ownership metadata for an active Epic connected account.

Inputs:

- `connectedAccountId`
- normalized owned games with provider game ID, title, optional slug, optional developer/publisher, and optional acquired date

Writes:

- `Game`
- `ExternalGameId`
- `Ownership`
- `ConnectedAccount.lastSyncedAt`

Security constraints:

- Does not fetch private Epic library data.
- Does not store passwords, tokens, or cookies.
- Requires an active Epic `ConnectedAccount`.
- Does not remove ownership records that are absent from a sync payload.

### `EpicGamesCheckoutService`

Generates user-assisted Epic checkout URLs from normalized free offers.

### `EpicAccountConnectionService`

Creates and consumes one-time account connection state values.

Security constraints:

- raw state value is returned once and never persisted.
- SHA-256 state hash is persisted.
- state expires after 10 minutes.
- state can be consumed only once.

### `AuthService`

Creates and validates application sessions.

Security constraints:

- stores SHA-256 token hashes only.
- raw bearer tokens are returned once and never persisted.
- sessions expire after 30 days.
- revoked or expired sessions are rejected.
- successful authentication updates `lastUsedAt`.

### `AuthenticatedUserGuard`

Protects user endpoints with `Authorization: Bearer <session-token>`.

### `InternalApiKeyGuard`

Protects internal endpoints with an `x-api-key` header.

Security constraints:

- denies access when `INTERNAL_API_KEY` is missing.
- uses timing-safe comparison for equal-length keys.
- currently intended only for internal/admin endpoints, not end-user authentication.

## Planned HTTP Surface

- public signup/login flow or external identity-provider callback.
- authenticated public account connection endpoints using `AuthenticatedUserGuard`.
