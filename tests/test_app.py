from backend import AppSettings, ClaimWeekGamesFoundation


def test_foundation_health_reflects_configured_dependencies() -> None:
    app = ClaimWeekGamesFoundation(
        settings=AppSettings(
            app_name="ClaimWeekGames",
            environment="test",
            database_url="postgresql://localhost/claimweekgames",
            redis_url=None,
            internal_api_key="test-key",
        )
    )

    health = app.health().as_dict()

    assert health["status"] == "ok"
    assert health["appName"] == "ClaimWeekGames"
    assert health["databaseConfigured"] is True
    assert health["redisConfigured"] is False


def test_foundation_authorizes_internal_request() -> None:
    app = ClaimWeekGamesFoundation(
        settings=AppSettings(
            app_name="ClaimWeekGames",
            environment="test",
            database_url=None,
            redis_url=None,
            internal_api_key="test-key",
        )
    )

    assert app.authorize_internal_request({"x-api-key": "test-key"}) is True
    assert app.authorize_internal_request({"x-api-key": "wrong"}) is False
