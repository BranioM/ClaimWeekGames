from backend.security import REDACTED, redact_mapping, verify_internal_api_key


def test_internal_api_key_verification_fails_closed() -> None:
    assert verify_internal_api_key(configured_key=None, supplied_key="key") is False
    assert verify_internal_api_key(configured_key="key", supplied_key=None) is False
    assert verify_internal_api_key(configured_key="key", supplied_key="wrong") is False


def test_internal_api_key_verification_accepts_matching_key() -> None:
    assert verify_internal_api_key(configured_key="key", supplied_key="key") is True


def test_redact_mapping_removes_nested_secrets() -> None:
    payload = {
        "user": "demo",
        "password": "secret",
        "nested": {
            "accessToken": "token",
            "safe": "value",
        },
        "items": [
            {"api-key": "key"},
            {"name": "visible"},
        ],
    }

    redacted = redact_mapping(payload)

    assert redacted["user"] == "demo"
    assert redacted["password"] == REDACTED
    assert redacted["nested"] == {"accessToken": REDACTED, "safe": "value"}
    assert redacted["items"] == [{"api-key": REDACTED}, {"name": "visible"}]
