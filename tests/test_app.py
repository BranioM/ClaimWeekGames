from fastapi.testclient import TestClient

from backend import AppSettings, ClaimWeekGamesFoundation
from backend.app import create_app


def test_health_returns_exact_minimal_payload() -> None:
    client = TestClient(
        create_app(
            AppSettings(
                app_name="ClaimWeekGames",
                environment="test",
                internal_api_key="test-key",
            )
        )
    )

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_status_contains_operational_metadata_not_health() -> None:
    client = TestClient(
        create_app(
            AppSettings(
                app_name="ClaimWeekGames",
                environment="test",
                internal_api_key="test-key",
            )
        )
    )

    response = client.get("/status")

    assert response.status_code == 200
    assert (
        response.json().items()
        >= {
            "status": "ok",
            "appName": "ClaimWeekGames",
            "environment": "test",
            "storage": "json",
            "vault": "planned",
        }.items()
    )


def test_foundation_authorizes_internal_request() -> None:
    app = ClaimWeekGamesFoundation(
        settings=AppSettings(
            app_name="ClaimWeekGames",
            environment="test",
            internal_api_key="test-key",
        )
    )

    assert app.authorize_internal_request({"x-api-key": "test-key"}) is True
    assert app.authorize_internal_request({"x-api-key": "wrong"}) is False


def test_internal_endpoint_rejects_missing_or_invalid_key() -> None:
    client = TestClient(
        create_app(
            AppSettings(
                app_name="ClaimWeekGames",
                environment="test",
                internal_api_key="test-key",
            )
        )
    )

    assert client.get("/internal/ping").status_code == 401
    invalid_response = client.get(
        "/internal/ping",
        headers={"x-api-key": "wrong"},
    )

    assert invalid_response.status_code == 401


def test_internal_endpoint_accepts_valid_key() -> None:
    client = TestClient(
        create_app(
            AppSettings(
                app_name="ClaimWeekGames",
                environment="test",
                internal_api_key="test-key",
            )
        )
    )

    response = client.get("/internal/ping", headers={"x-api-key": "test-key"})

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
