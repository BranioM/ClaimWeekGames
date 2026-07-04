# Database

Database: PostgreSQL

ORM: Prisma 7

## Core Model

```text
User
  -> ConnectedAccount
    -> Ownership
      -> Game

Platform
  -> ConnectedAccount
  -> FreeGameOffer
  -> ExternalGameId

Game
  -> ExternalGameId
  -> FreeGameOffer
  -> Ownership
```

## Tables

### `User`

Application user.

Important fields:

- `id`
- `email`
- `createdAt`

### `Platform`

Digital store, currently used as the Store concept.

Important fields:

- `id`
- `name`
- `createdAt`

### `ConnectedAccount`

User's account on a platform.

Important fields:

- `userId`
- `platformId`
- `accountKey`
- `externalAccountId`
- `displayName`
- `status`
- `lastSyncedAt`
- `disconnectedAt`

Constraints:

- unique `(userId, platformId, accountKey)`
- unique `(platformId, externalAccountId)`

### `AccountConnectionState`

One-time state used during secure account onboarding.

Important fields:

- `stateHash`
- `expiresAt`
- `consumedAt`
- `userId`
- `platformId`

Constraints:

- unique `stateHash`
- indexed `(userId, platformId, consumedAt, expiresAt)`

### `Game`

Canonical game metadata.

Important fields:

- `title`
- `slug`
- `developer`
- `publisher`

### `ExternalGameId`

Maps store-specific game identifiers to canonical games.

Constraints:

- unique `(platformId, providerGameId)`

### `Ownership`

Represents a game owned by a connected account.

Constraints:

- unique `(connectedAccountId, gameId)`

### `FreeGameOffer`

Represents a detected free-game offer window.

Constraints:

- unique `(platformId, externalOfferId)`
- unique `(gameId, platformId, startDate, endDate)`

## Migration Policy

- Prefer additive migrations.
- Do not remove user data automatically.
- Destructive migrations require explicit approval.
