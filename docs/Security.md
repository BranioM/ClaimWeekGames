# Security

## Current Security Posture

The project currently avoids credential custody.

Implemented safeguards:

- No Epic passwords are stored.
- No Epic tokens are stored.
- Epic connection state stores only SHA-256 hashes.
- Connection state expires after 10 minutes.
- Connection state is one-time-use.
- Epic free-game fetch uses HTTPS only.
- Epic free-game fetch allows only known Epic promotion hosts.
- Epic free-game fetch has an explicit timeout.
- Epic promotion JSON is parsed defensively.
- Claiming is user-assisted through Epic checkout links, not automated purchase.
- Epic ownership sync is metadata-only and does not fetch private Epic library data.
- Ownership sync does not delete missing ownerships automatically.
- Internal sync endpoints require an `x-api-key` header matching `INTERNAL_API_KEY`.
- Internal sync endpoints deny access if `INTERNAL_API_KEY` is not configured.

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

- `POST /api/internal/epic/sync/free-offers`
- `POST /api/internal/epic/sync/ownerships`

These endpoints are guarded by `InternalApiKeyGuard` and are not a replacement for user authentication.

## Open Security Work

- Authentication/session design.
- Authorization guards.
- Authenticated Epic library retrieval design.
- Request validation layer.
- Rate limiting.
- Secret encryption design for any future token persistence.
- Event/audit log model.
