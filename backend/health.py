"""Health snapshot helpers for the backend foundation."""

from dataclasses import dataclass
from datetime import UTC, datetime

from backend.config import AppSettings


@dataclass(frozen=True, slots=True)
class HealthSnapshot:
    status: str
    app_name: str
    environment: str
    database_configured: bool
    redis_configured: bool
    timestamp: datetime

    def as_dict(self) -> dict[str, str | bool]:
        return {
            "status": self.status,
            "appName": self.app_name,
            "environment": self.environment,
            "databaseConfigured": self.database_configured,
            "redisConfigured": self.redis_configured,
            "timestamp": self.timestamp.isoformat(),
        }


def build_health_snapshot(settings: AppSettings) -> HealthSnapshot:
    return HealthSnapshot(
        status="ok",
        app_name=settings.app_name,
        environment=settings.environment,
        database_configured=bool(settings.database_url),
        redis_configured=bool(settings.redis_url),
        timestamp=datetime.now(UTC),
    )
