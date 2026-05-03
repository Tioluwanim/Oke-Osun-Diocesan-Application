import os
import sys
from pathlib import Path
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient

import main
from routes import auth as auth_routes

client = TestClient(main.app)


class DummyUsers:
    async def find_one(self, query):
        return None


class DummyUserDuplicate:
    async def find_one(self, query):
        return {"email": "existing@example.com", "password": "hashed"}


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "Oke-Osun Diocese API is running"}


def test_login_endpoint_invalid_credentials(monkeypatch):
    monkeypatch.setattr(auth_routes, "db", SimpleNamespace(users=DummyUsers()))
    response = client.post("/auth/login", json={"email": "unknown@example.com", "password": "badpass"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_register_endpoint_duplicate_email(monkeypatch):
    monkeypatch.setattr(auth_routes, "db", SimpleNamespace(users=DummyUserDuplicate()))
    response = client.post("/auth/register", json={
        "fullName": "Test User",
        "email": "existing@example.com",
        "password": "Password123!",
        "role": "member",
        "parish": "Test Parish"
    })
    assert response.status_code == 400
    assert response.json()["detail"] == "An account with this email already exists"
