# ClaimWeekGames

ClaimWeekGames is an Epic free-games claim assistant.

The app helps a user see current Epic free games and, in later sprints, track manual claiming across local account labels without storing Epic credentials.

## Sprint 1 Scope

Implemented:

- Python 3.13 project configuration with `uv`
- FastAPI backend foundation
- public `GET /health`
- future-facing `GET /status`
- fail-closed internal API-key validation helper
- recursive secret redaction helper
- Dockerfile
- Docker Compose for the backend only
- GitHub Actions CI
- project security and architecture docs
- React + TypeScript + Vite frontend skeleton

Explicitly not included:

- NestJS
- Prisma
- PostgreSQL
- Redis
- multi-store library architecture
- Epic implementation
- Epic credential storage
- automated Epic login or automated claiming

## Stack

Backend:

- Python 3.13
- FastAPI
- Uvicorn
- `uv`

Frontend:

- React
- TypeScript
- Vite

Storage:

- Sprint 1 has no database service.
- Version 1.0 storage target is local JSON.
- Sensitive persistence requires a future encrypted Vault design.

## Local Development

Install Python dependencies:

```sh
uv sync
```

Run the backend:

```sh
uv run uvicorn backend.app:app --reload
```

Check health:

```sh
curl http://localhost:8000/health
```

Expected response:

```json
{"status":"ok"}
```

Run with Docker Compose:

```sh
docker compose up --build
```

## Validation

Run:

```sh
uv run black --check backend tests
uv run ruff check backend tests
uv run mypy backend tests
uv run pytest
```

## Security

ClaimWeekGames must not store Epic passwords, cookies, access tokens, refresh tokens, or session tokens.

Internal API-key checks fail closed and compare hashed values with constant-time comparison. Redaction helpers remove common secret fields from nested payloads.

See `SECURITY.md` for the current policy.
