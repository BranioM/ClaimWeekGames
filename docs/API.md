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
    "platform": {
      "id": "platform-id",
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

Runs Epic free-offer synchronization.

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

- `Platform`
- `Game`
- `ExternalGameId`
- `FreeGameOffer`

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
