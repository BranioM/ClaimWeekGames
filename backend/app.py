"""FastAPI application foundation for ClaimWeekGames."""

from collections.abc import Mapping
from dataclasses import dataclass
from typing import Annotated

from fastapi import FastAPI, Header, HTTPException, status

from backend.config import AppSettings
from backend.health import build_status_snapshot
from backend.security import verify_internal_api_key


@dataclass(frozen=True, slots=True)
class ClaimWeekGamesFoundation:
    """Small application core used by the FastAPI adapter."""

    settings: AppSettings

    @classmethod
    def from_environment(cls) -> "ClaimWeekGamesFoundation":
        return cls(settings=AppSettings.from_environment())

    def status(self) -> dict[str, str]:
        return build_status_snapshot(self.settings)

    def authorize_internal_request(self, headers: Mapping[str, str]) -> bool:
        supplied_key = headers.get("x-api-key") or headers.get("X-API-Key")
        return verify_internal_api_key(
            configured_key=self.settings.internal_api_key,
            supplied_key=supplied_key,
        )


def create_app(settings: AppSettings | None = None) -> FastAPI:
    foundation = ClaimWeekGamesFoundation(
        settings=settings or AppSettings.from_environment()
    )
    fastapi_app = FastAPI(
        title="ClaimWeekGames",
        summary="Epic free-games claim assistant API.",
        version="0.1.0",
    )

    @fastapi_app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @fastapi_app.get("/status")
    def service_status() -> dict[str, str]:
        return foundation.status()

    @fastapi_app.get("/internal/ping")
    def internal_ping(
        x_api_key: Annotated[str | None, Header(alias="x-api-key")] = None,
    ) -> dict[str, str]:
        if not verify_internal_api_key(
            configured_key=foundation.settings.internal_api_key,
            supplied_key=x_api_key,
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Valid internal API key is required",
            )

        return {"status": "ok"}

    return fastapi_app


app = create_app()
