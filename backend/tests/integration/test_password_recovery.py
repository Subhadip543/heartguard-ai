from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import hash_password, hash_reset_token
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models import Patient, PasswordResetToken


@pytest.fixture
def client_and_db():
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    TestingSessionLocal = sessionmaker(
        bind=test_engine,
        autoflush=False,
        autocommit=False,
    )

    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    client = TestClient(app)
    db = TestingSessionLocal()

    try:
        yield client, db
    finally:
        db.close()
        app.dependency_overrides.clear()


def test_forgot_password_generic_response(client_and_db):
    """Forgot password returns identical generic message whether account exists or not."""
    client, db = client_and_db

    # Create patient
    patient = Patient(
        name="John Doe",
        email="john.doe@example.com",
        phone="9876543210",
        hashed_password=hash_password("OldPassword123!"),
    )
    db.add(patient)
    db.commit()

    # Existing email
    resp_existing = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "john.doe@example.com"},
    )
    assert resp_existing.status_code == 200
    data_existing = resp_existing.json()
    assert "If an account exists with this email" in data_existing["message"]
    assert data_existing["debug_token"] is not None

    # Non-existent email
    resp_nonexistent = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "nonexistent@example.com"},
    )
    assert resp_nonexistent.status_code == 200
    data_nonexistent = resp_nonexistent.json()
    assert "If an account exists with this email" in data_nonexistent["message"]
    assert data_nonexistent["debug_token"] is None


def test_forgot_password_invalidates_prior_tokens(client_and_db):
    """Requesting a new reset token invalidates any prior unused tokens for that patient."""
    client, db = client_and_db

    patient = Patient(
        name="Jane Smith",
        email="jane.smith@example.com",
        phone="9876543211",
        hashed_password=hash_password("Password123!"),
    )
    db.add(patient)
    db.commit()

    resp1 = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "jane.smith@example.com"},
    )
    token1 = resp1.json()["debug_token"]

    resp2 = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "jane.smith@example.com"},
    )
    token2 = resp2.json()["debug_token"]

    assert token1 != token2

    # Attempting to use token1 should fail because it was invalidated by token2
    reset_resp1 = client.post(
        "/api/v1/auth/reset-password",
        json={"token": token1, "new_password": "NewSecurePassword123!"},
    )
    assert reset_resp1.status_code == 400
    assert "already been used" in reset_resp1.json()["detail"].lower()

    # Using token2 should succeed
    reset_resp2 = client.post(
        "/api/v1/auth/reset-password",
        json={"token": token2, "new_password": "NewSecurePassword123!"},
    )
    assert reset_resp2.status_code == 200


def test_reset_password_flow_and_login_verification(client_and_db):
    """Patient can reset password with valid token and log in with new password immediately."""
    client, db = client_and_db

    patient = Patient(
        name="Alice Walker",
        email="alice.walker@example.com",
        phone="9876543212",
        hashed_password=hash_password("OriginalPassword123!"),
    )
    db.add(patient)
    db.commit()

    # Request reset
    forgot_resp = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "alice.walker@example.com"},
    )
    raw_token = forgot_resp.json()["debug_token"]

    # Reset password
    reset_resp = client.post(
        "/api/v1/auth/reset-password",
        json={"token": raw_token, "new_password": "BrandNewPassword123!"},
    )
    assert reset_resp.status_code == 200

    # Old password fails login
    old_login = client.post(
        "/api/v1/auth/login",
        json={"email": "alice.walker@example.com", "password": "OriginalPassword123!"},
    )
    assert old_login.status_code == 401

    # New password succeeds login
    new_login = client.post(
        "/api/v1/auth/login",
        json={"email": "alice.walker@example.com", "password": "BrandNewPassword123!"},
    )
    assert new_login.status_code == 200
    assert "token" in new_login.json()


def test_reset_password_with_expired_token(client_and_db):
    """Expired reset tokens are rejected with 400 Bad Request."""
    client, db = client_and_db

    patient = Patient(
        name="Bob Martin",
        email="bob.martin@example.com",
        phone="9876543213",
        hashed_password=hash_password("Password123!"),
    )
    db.add(patient)
    db.commit()

    forgot_resp = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "bob.martin@example.com"},
    )
    raw_token = forgot_resp.json()["debug_token"]

    # Manually expire token in database
    token_hash = hash_reset_token(raw_token)
    db_token = db.scalar(
        select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)
    )
    db_token.expires_at = datetime.now(timezone.utc) - timedelta(minutes=5)
    db.commit()

    reset_resp = client.post(
        "/api/v1/auth/reset-password",
        json={"token": raw_token, "new_password": "NewPassword123!"},
    )
    assert reset_resp.status_code == 400
    assert "expired" in reset_resp.json()["detail"].lower()


def test_reset_password_with_invalid_token(client_and_db):
    """Non-existent token returns 400 Bad Request."""
    client, _ = client_and_db

    reset_resp = client.post(
        "/api/v1/auth/reset-password",
        json={"token": "completely_fake_invalid_token_12345", "new_password": "NewPassword123!"},
    )
    assert reset_resp.status_code == 400
    assert "invalid or expired" in reset_resp.json()["detail"].lower()
