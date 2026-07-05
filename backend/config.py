"""Environment-backed application settings."""

from dataclasses import dataclass
from os import environ


@dataclass(frozen=True, slots=True)
class AppSettings:
    app_name: str
    environment: str
    internal_api_key: str | None
    storage_driver: str = "json"
    vault_status: str = "planned"

    @classmethod
    def from_environment(cls) -> "AppSettings":
        settings = cls(
            app_name=environ.get("APP_NAME", "ClaimWeekGames"),
            environment=environ.get("APP_ENV", "development"),
            internal_api_key=environ.get("INTERNAL_API_KEY"),
            storage_driver=environ.get("STORAGE_DRIVER", "json"),
            vault_status=environ.get("VAULT_STATUS", "planned"),
        )
        settings.validate()
        return settings

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    def validate(self) -> None:
        if self.is_production and not self.internal_api_key:
            raise RuntimeError("INTERNAL_API_KEY is required in production")

        if self.storage_driver != "json":
            raise RuntimeError("Sprint 1 supports only JSON storage")
