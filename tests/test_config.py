import pytest

from backend.config import AppSettings


def test_settings_load_from_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("APP_NAME", "ClaimWeekGames")
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("DATABASE_URL", "postgresql://localhost/claimweekgames")
    monkeypatch.setenv("REDIS_URL", "redis://localhost:6379/0")
    monkeypatch.setenv("INTERNAL_API_KEY", "internal-key")

    settings = AppSettings.from_environment()

    assert settings.app_name == "ClaimWeekGames"
    assert settings.environment == "test"
    assert settings.database_url == "postgresql://localhost/claimweekgames"
    assert settings.redis_url == "redis://localhost:6379/0"
    assert settings.internal_api_key == "internal-key"


def test_production_requires_internal_api_key() -> None:
    settings = AppSettings(
        app_name="ClaimWeekGames",
        environment="production",
        database_url=None,
        redis_url=None,
        internal_api_key=None,
    )

    with pytest.raises(RuntimeError, match="INTERNAL_API_KEY"):
        settings.validate()
