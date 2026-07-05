# ClaimWeekGames Agent Guide

## Scope

ClaimWeekGames is an Epic free-games claim assistant.

Sprint 1 Foundation uses:

- Python 3.13
- FastAPI
- React
- TypeScript
- Vite
- local JSON storage

Do not introduce NestJS, Prisma, PostgreSQL, Redis, or multi-store library abstractions in this foundation.

## Priorities

1. Security
2. Reliability
3. Simplicity
4. Tests
5. Maintainability

## Security Rules

- Never store Epic passwords, cookies, access tokens, refresh tokens, or session tokens.
- Keep claiming user-assisted unless a future official flow passes security review.
- Keep internal endpoints fail-closed.
- Redact secrets from logs, errors, and test output.

## Workflow

Before completion, run:

```sh
uv run black --check backend tests
uv run ruff check backend tests
uv run mypy backend tests
uv run pytest
```

Commit messages use:

```text
type: short description
```
