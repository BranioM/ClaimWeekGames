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
