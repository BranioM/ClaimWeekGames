"""Status snapshot helpers for the backend foundation."""

from datetime import UTC, datetime

from backend.config import AppSettings


def build_status_snapshot(settings: AppSettings) -> dict[str, str]:
    return {
        "status": "ok",
        "appName": settings.app_name,
        "environment": settings.environment,
        "storage": settings.storage_driver,
        "vault": settings.vault_status,
        "timestamp": datetime.now(UTC).isoformat(),
    }
