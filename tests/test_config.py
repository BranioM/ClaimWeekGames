import pytest

from backend.config import AppSettings


def test_settings_load_from_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("APP_NAME", "ClaimWeekGames")
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("INTERNAL_API_KEY", "internal-key")
    monkeypatch.setenv("STORAGE_DRIVER", "json")
    monkeypatch.setenv("VAULT_STATUS", "planned")

    settings = AppSettings.from_environment()

    assert settings.app_name == "ClaimWeekGames"
    assert settings.environment == "test"
    assert settings.internal_api_key == "internal-key"
    assert settings.storage_driver == "json"
    assert settings.vault_status == "planned"


def test_production_requires_internal_api_key() -> None:
    settings = AppSettings(
        app_name="ClaimWeekGames",
        environment="production",
        internal_api_key=None,
    )

    with pytest.raises(RuntimeError, match="INTERNAL_API_KEY"):
        settings.validate()


def test_foundation_rejects_non_json_storage() -> None:
    settings = AppSettings(
        app_name="ClaimWeekGames",
        environment="test",
        internal_api_key="test-key",
        storage_driver="postgresql",
    )

    with pytest.raises(RuntimeError, match="JSON storage"):
        settings.validate()
