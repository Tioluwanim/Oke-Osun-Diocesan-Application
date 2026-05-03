import importlib
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest

import utils.security as security


def test_jwt_create_and_decode(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "testsecret")
    importlib.reload(security)

    token = security.create_token("user@example.com", "member")
    payload = security.decode_token(token)

    assert payload["email"] == "user@example.com"
    assert payload["role"] == "member"
    assert "exp" in payload
    assert payload["exp"] > payload["iat"]


def test_jwt_requires_secret(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "")
    importlib.reload(security)

    with pytest.raises(RuntimeError, match="JWT_SECRET must be configured"):
        security.create_token("user@example.com", "member")
