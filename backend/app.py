"""Application foundation wiring.

This module intentionally avoids store-specific integrations. Digital store
providers should be added as feature modules after the secure core is in place.
"""

from collections.abc import Mapping
from dataclasses import dataclass

from backend.config import AppSettings
from backend.health import HealthSnapshot, build_health_snapshot
from backend.security import verify_internal_api_key


@dataclass(frozen=True, slots=True)
class ClaimWeekGamesFoundation:
    """Small application core used by future API adapters."""

    settings: AppSettings

    @classmethod
    def from_environment(cls) -> "ClaimWeekGamesFoundation":
        return cls(settings=AppSettings.from_environment())

    def health(self) -> HealthSnapshot:
        return build_health_snapshot(self.settings)

    def authorize_internal_request(self, headers: Mapping[str, str]) -> bool:
        supplied_key = headers.get("x-api-key") or headers.get("X-API-Key")
        return verify_internal_api_key(
            configured_key=self.settings.internal_api_key,
            supplied_key=supplied_key,
        )
