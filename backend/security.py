"""Security primitives for internal foundation services."""

from __future__ import annotations

from collections.abc import Mapping
from hashlib import sha256
from hmac import compare_digest
from typing import Any

SENSITIVE_KEY_MARKERS = (
    "api_key",
    "apikey",
    "authorization",
    "cookie",
    "password",
    "secret",
    "session",
    "token",
)
REDACTED = "[REDACTED]"


def hash_secret(secret: str) -> str:
    return sha256(secret.encode("utf-8")).hexdigest()


def verify_internal_api_key(
    *, configured_key: str | None, supplied_key: str | None
) -> bool:
    """Validate an internal API key without storing or logging raw values.

    Missing configuration fails closed.
    """

    if not configured_key or not supplied_key:
        return False

    return compare_digest(hash_secret(configured_key), hash_secret(supplied_key))


def redact_mapping(value: Mapping[str, Any]) -> dict[str, Any]:
    redacted: dict[str, Any] = {}

    for key, item in value.items():
        if is_sensitive_key(key):
            redacted[key] = REDACTED
        elif isinstance(item, Mapping):
            redacted[key] = redact_mapping(item)
        elif isinstance(item, list):
            redacted[key] = [
                redact_mapping(entry) if isinstance(entry, Mapping) else entry
                for entry in item
            ]
        else:
            redacted[key] = item

    return redacted


def is_sensitive_key(key: str) -> bool:
    normalized = key.lower().replace("-", "_")
    return any(marker in normalized for marker in SENSITIVE_KEY_MARKERS)
