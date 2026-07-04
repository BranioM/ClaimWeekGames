# Decisions

## 2026-07-04: Use Prisma 7 with Driver Adapter

Decision: keep Prisma 7 and use `@prisma/adapter-pg` for PostgreSQL.

Reason: Prisma 7's generated client expects the current adapter-based setup. Downgrading would avoid the immediate runtime issue but move the project away from current Prisma conventions.

## 2026-07-04: Use ESM for the NestJS API

Decision: make the API package ESM-compatible instead of compiling Prisma's ESM generated client into CommonJS output.

Reason: the runtime failure was caused by mixed ESM/CommonJS output. A coherent ESM API avoids that class of failure.

## 2026-07-04: Model Store Accounts Explicitly

Decision: represent multi-account support with `ConnectedAccount` between `User` and `Ownership`.

Reason: a user can have multiple accounts per store, and a game may be owned on multiple accounts or stores. Ownership must attach to the connected account, not directly to the user/store pair.

## 2026-07-04: Do Not Store Epic Passwords

Decision: account connection stores only metadata and one-time hashed state values.

Reason: password storage would introduce unnecessary security risk. Any future authenticated Epic integration must use a reviewed token/session strategy with encryption at rest.

## 2026-07-04: Start Claiming With User-Assisted Checkout Links

Decision: generate Epic checkout links instead of implementing automated purchasing.

Reason: it avoids credential custody and reduces automation risk while still helping users claim free games.

## 2026-07-04: Implement Ownership Sync as Metadata Persistence First

Decision: add Epic ownership sync as an internal service that accepts normalized owned-game metadata and persists `Game`, `ExternalGameId`, and `Ownership` records.

Reason: this validates the data model and sync behavior without introducing private library fetching, token storage, or credential custody before the auth/session design is complete.

## 2026-07-04: Separate Public Reads From Internal Sync

Decision: expose active free offers publicly while protecting sync endpoints with an internal API key guard.

Reason: free-offer reads are low-risk public data, but synchronization mutates database state and must not be callable without an explicit internal/admin boundary.
