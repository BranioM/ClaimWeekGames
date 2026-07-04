# ClaimWeekGames Agent Guide

ClaimWeekGames is an open-source application that automatically tracks, synchronizes, and manages free games and owned games across multiple digital game stores.

The long-term goal is to provide a single unified game library for the user.

## Primary Goals

Priority order:

1. Reliability
2. Clean architecture
3. Automated testing
4. Maintainability
5. Performance

Never sacrifice correctness for speed.

## Technology Stack

Backend:

- NestJS
- TypeScript
- Prisma
- PostgreSQL
- Redis

Frontend:

- Next.js
- React
- TypeScript

Infrastructure:

- Docker
- Docker Compose
- GitHub Actions

Package manager:

- npm

## Architecture

Use modular architecture.

Every feature should have its own NestJS module.

Examples:

- EpicModule
- SteamModule
- NotificationModule
- LibraryModule
- SchedulerModule

Business logic belongs in services. Controllers should remain thin.

For system design details, see `docs/architecture.md`.

## Documentation

Always maintain these files when the related area changes:

- `docs/architecture.md` for system design, modules, and flow diagrams.
- `docs/Roadmap.md` for planned milestones and next work.
- `docs/project-status.md` for current capabilities, verification, and open work.
- `docs/Decisions.md` for architectural and security decisions.
- `docs/api.md` for public and internal API/service contracts.
- `docs/database.md` for schema, relationships, and migration policy.
- `docs/security.md` for security posture, requirements, and open risks.

## Database

Use Prisma.

Prefer additive migrations.

Avoid destructive migrations unless explicitly requested.

Never remove user data automatically.

## Code Style

Follow official NestJS conventions.

Prefer:

- small classes
- dependency injection
- constructor injection
- async/await
- strong typing

Avoid:

- any
- duplicated code
- unnecessary abstraction

## Git

Commit frequently.

Each commit should represent one logical change.

Commit message format:

```text
type: short description
```

Examples:

- `feat: implement Epic synchronization`
- `fix: resolve Prisma startup issue`
- `refactor: simplify ownership service`
- `docs: update architecture`

## Testing

Before considering work complete:

- project builds
- tests pass
- application starts
- database migrations succeed

Never leave the repository in a broken state.

## Epic Games

Epic Games is the highest priority integration.

Implement:

- weekly free games
- historical offers
- owned games synchronization
- multi-account support
- duplicate detection

## Future Integrations

Design all code so new stores can be added without major refactoring.

Expected stores:

- Steam
- GOG
- Xbox
- Amazon Games
- Ubisoft Connect
- EA App

## Unified Library

A game may exist on multiple stores.

Never assume ownership is unique to one store.

Track ownership separately from game metadata.

## Notifications

Support:

- Email
- Discord
- Push notifications

Notifications should be event-driven.

## Security

Never commit:

- secrets
- tokens
- passwords
- API keys

Use environment variables.

## Development Workflow

When given a task:

1. Inspect the repository.
2. Understand existing code.
3. Implement the feature.
4. Run builds.
5. Run tests.
6. Fix failures.
7. Commit the result.

Prefer autonomous execution over asking for unnecessary confirmations.

## General Principle

Optimize for a project that will still be maintainable in five years.
