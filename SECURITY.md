# Security Policy

ClaimWeekGames is currently scoped to an Epic free-games claim assistant.

## Current Boundary

- The backend is FastAPI on Python 3.13.
- `/health` is public and returns only `{"status":"ok"}`.
- Internal endpoints must fail closed when an API key is missing or invalid.
- API key validation uses constant-time comparison of hashed values.
- Logs and errors must redact passwords, cookies, tokens, sessions, API keys, and authorization headers.

## Explicit Non-Goals

- No Epic passwords.
- No Epic cookies.
- No Epic access tokens or refresh tokens.
- No automated Epic login.
- No automated claiming.
- No database service in Sprint 1.
- No Redis service in Sprint 1.
- No multi-store library scope in Sprint 1.

## Storage Direction

Version 1.0 storage is local JSON. Sensitive values require an encrypted Vault design before persistence.

## Reporting

Do not open public issues containing secrets or exploit details. Report privately to the repository owner first.
