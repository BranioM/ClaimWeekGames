# Architecture

## Sprint 1 Components

```text
User
  -> Vite React frontend
  -> FastAPI backend
    -> /health
    -> /status
    -> internal security helpers
  -> JSON storage later
  -> encrypted Vault later
```

## Backend

The backend is a Python 3.13 FastAPI application.

- `/health` returns exactly `{"status":"ok"}`.
- `/status` is reserved for metadata such as app name, environment, storage mode, Vault readiness, and timestamp.
- Internal API-key verification is constant-time and fail-closed.
- Redaction is recursive for mappings and lists.

## Frontend

The frontend target is React + TypeScript + Vite. Sprint 1 only defines the boundary; product UI starts after the backend foundation is stable.

## Storage

Sprint 1 has no database service. Version 1.0 storage is JSON. Sensitive persistence requires the encrypted Vault design.
