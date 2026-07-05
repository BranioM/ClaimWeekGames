# ClaimWeekGames Constitution

## Product Scope

ClaimWeekGames helps a user track active Epic free games and claim them manually and safely.

## Non-Negotiables

- Do not store Epic credentials.
- Do not automate Epic login or purchases.
- Keep `/health` minimal.
- Keep internal mutation surfaces protected.
- Prefer JSON storage until the encrypted Vault design exists.

## Technical Scope

- Backend: Python 3.13 + FastAPI
- Frontend: React + TypeScript + Vite
- Runtime validation: Black, Ruff, MyPy, Pytest

## Out of Scope For Sprint 1

- NestJS
- Prisma
- PostgreSQL
- Redis
- multi-store library management
- Epic implementation
