"""Environment-backed application settings."""

from dataclasses import dataclass
from os import environ


@dataclass(frozen=True, slots=True)
class AppSettings:
    app_name: str
    environment: str
    database_url: str | None
    redis_url: str | None
    internal_api_key: str | None

    @classmethod
    def from_environment(cls) -> "AppSettings":
        settings = cls(
            app_name=environ.get("APP_NAME", "ClaimWeekGames"),
            environment=environ.get("APP_ENV", "development"),
            database_url=environ.get("DATABASE_URL"),
            redis_url=environ.get("REDIS_URL"),
            internal_api_key=environ.get("INTERNAL_API_KEY"),
        )
        settings.validate()
        return settings

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    def validate(self) -> None:
        if self.is_production and not self.internal_api_key:
            raise RuntimeError("INTERNAL_API_KEY is required in production")
