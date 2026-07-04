# Security

## Current Security Posture

The project currently avoids credential custody.

Implemented safeguards:

- No Epic passwords are stored.
- No Epic tokens are stored.
- Epic connection state stores only SHA-256 hashes.
- Connection state expires after 10 minutes.
- Connection state is one-time-use.
- Application session tokens are hashed at rest.
- Application session tokens expire and can be revoked.
- Epic free-game fetch uses HTTPS only.
- Epic free-game fetch allows only known Epic promotion hosts.
- Epic free-game fetch has an explicit timeout.
- Epic promotion JSON is parsed defensively.
- Claiming is user-assisted through Epic checkout links, not automated purchase.
- Epic ownership sync is metadata-only and does not fetch private Epic library data.
- Ownership sync does not delete missing ownerships automatically.
- Internal sync endpoints require an `x-api-key` header matching `INTERNAL_API_KEY`.
- Internal sync endpoints deny access if `INTERNAL_API_KEY` is not configured.
- Internal account connection endpoints require the same API-key boundary until user authentication exists.
- E2E tests verify authenticated and internal API-key boundaries reject unauthenticated requests.

## Secrets Policy

Never commit:

- passwords
- API keys
- OAuth secrets
- access tokens
- refresh tokens
- session cookies

Use environment variables for configuration.

## Future Token Storage Requirements

If authenticated Epic ownership sync requires tokens or cookies, implement all of the following before persistence:

- encryption at rest
- key rotation plan
- token scope minimization
- expiry tracking
- revocation/disconnect flow
- audit logging for connection and sync events
- tests proving secrets are not returned by public APIs

## Network Security

External requests must:

- use HTTPS
- validate allowed hosts
- set timeouts
- avoid following user-controlled redirects into arbitrary hosts
- parse all external JSON as untrusted input

## API Security Requirements

Before adding public account or sync endpoints:

- add authentication
- authorize access by user ownership
- validate request bodies
- rate-limit account connection endpoints
- keep internal/admin sync endpoints separate from public user endpoints

Current internal endpoint boundary:

- `POST /api/internal/auth/sessions`
- `POST /api/internal/epic/sync/free-offers`
- `POST /api/internal/epic/sync/ownerships`
- `POST /api/internal/epic/accounts/connection-state`
- `POST /api/internal/epic/accounts/connect`

These endpoints are guarded by `InternalApiKeyGuard` and are not a replacement for user authentication.

### API Key Guard

`InternalApiKeyGuard` protects internal mutation endpoints with the `x-api-key` header.

Rules:

- the configured key must come from `INTERNAL_API_KEY`.
- missing configuration fails closed.
- missing request header fails closed.
- invalid keys are rejected.
- comparisons use timing-safe comparison for equal-length values.

The internal API key is for service/admin boundaries only. It is not user authentication.

Current authenticated user boundary:

- `GET /api/me`

This endpoint is guarded by `AuthenticatedUserGuard` and requires an opaque bearer session token.

### Bearer Sessions

Authenticated user endpoints use `Authorization: Bearer <session-token>`.

Session rules:

- raw session tokens are returned once.
- only SHA-256 token hashes are stored.
- expired sessions are rejected.
- revoked sessions are rejected.
- successful authentication updates session `lastUsedAt`.

Bearer sessions currently identify application users. They do not yet provide fine-grained authorization for every user-owned resource.

### Secret Handling

Secrets must stay out of Git.

Use environment variables for:

- `DATABASE_URL`
- `REDIS_URL`
- `INTERNAL_API_KEY`
- future OAuth client secrets
- future encryption keys

Do not log secrets, session tokens, OAuth tokens, cookies, or API keys.

### Current Authentication Limitations

Current limitations:

- no public signup flow yet.
- no public login flow yet.
- internal session bootstrap exists only behind `InternalApiKeyGuard`.
- no refresh-token flow.
- no user-facing session revocation endpoint.
- no rate limiting yet.
- no encrypted third-party token storage yet.

## Open Security Work

- Public signup/login or external identity-provider callback.
- Session revocation endpoint.
- User-scoped authorization guards.
- Authenticated Epic library retrieval design.
- Request validation layer.
- Rate limiting.
- Secret encryption design for any future token persistence.
- Event/audit log model.
