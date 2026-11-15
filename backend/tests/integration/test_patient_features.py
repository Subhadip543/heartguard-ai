
import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base import Base
from app.db.session import get_db

# Import models so SQLAlchemy registers their tables.
from app.models import Assessment, Patient  # noqa: F401


# --------------------------------------------------
# TEST DATABASE
# --------------------------------------------------

@pytest.fixture
def client():
    """
    Create a fresh in-memory SQLite database for each test.
    Never uses the actual PostgreSQL database.
    """

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

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()


# --------------------------------------------------
# TEST DATA
# --------------------------------------------------

@pytest.fixture
def patient_data():
    return {
        "name": "Test Patient",
        "email": "testpatient@example.com",
        "phone": "9876543210",
        "password": "TestPassword@123",
    }


@pytest.fixture
def valid_patient():
    return {
        "age": 55,
        "sex": 1,
        "cp": 4,
        "trestbps": 140,
        "chol": 240,
        "fbs": 0,
        "restecg": 0,
        "thalach": 150,
        "exang": 0,
        "oldpeak": 1.0,
        "slope": 2,
        "ca": 0,
        "thal": 3,
    }


# --------------------------------------------------
# HELPER FUNCTIONS
# --------------------------------------------------

def register_patient(client, patient_data):
    return client.post(
        "/api/v1/auth/register",
        json=patient_data,
    )


def login_patient(client, email, password):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert response.status_code == 200

    return response.json()["token"]


def authenticate(client, token):
    client.headers.update({
        "Authorization": f"Bearer {token}"
    })


def mock_prediction(*args, **kwargs):
    return {
        "prediction": 0,
        "prediction_label": "negative_class",
        "positive_probability": 0.3762,
        "threshold": kwargs.get("threshold", 0.5),
        "model_name": "Random Forest",
    }


# --------------------------------------------------
# AUTHENTICATION TESTS
# --------------------------------------------------

def test_patient_registration(client, patient_data):
    response = register_patient(client, patient_data)

    assert response.status_code == 201

    data = response.json()

    assert data["message"] == "Registration successful."
    assert data["patient"]["name"] == patient_data["name"]
    assert data["patient"]["email"] == patient_data["email"]

    # Password must never be returned.
    assert "password" not in data["patient"]
    assert "hashed_password" not in data["patient"]


def test_duplicate_registration_returns_409(client, patient_data):
    first_response = register_patient(client, patient_data)

    assert first_response.status_code == 201

    second_response = register_patient(client, patient_data)

    assert second_response.status_code == 409


def test_successful_login(client, patient_data):
    register_patient(client, patient_data)

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": patient_data["email"],
            "password": patient_data["password"],
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "Login successful."
    assert data["token_type"] == "bearer"
    assert data["token"]
    assert data["patient"]["email"] == patient_data["email"]


def test_invalid_password_returns_401(client, patient_data):
    register_patient(client, patient_data)

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": patient_data["email"],
            "password": "WrongPassword@123",
        },
    )

    assert response.status_code == 401


def test_auth_me_requires_authentication(client):
    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401


def test_auth_me_returns_authenticated_patient(client, patient_data):
    register_patient(client, patient_data)

    token = login_patient(
        client,
        patient_data["email"],
        patient_data["password"],
    )

    authenticate(client, token)

    response = client.get("/api/v1/auth/me")

    assert response.status_code == 200
    assert response.json()["email"] == patient_data["email"]


# --------------------------------------------------
# PATIENT PROFILE TESTS
# --------------------------------------------------

def test_patient_profile_requires_authentication(client):
    response = client.get("/api/v1/patients/me")

    assert response.status_code == 401


def test_patient_can_view_own_profile(client, patient_data):
    register_patient(client, patient_data)

    token = login_patient(
        client,
        patient_data["email"],
        patient_data["password"],
    )

    authenticate(client, token)

    response = client.get("/api/v1/patients/me")

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == patient_data["name"]
    assert data["email"] == patient_data["email"]
    assert data["phone"] == patient_data["phone"]
    assert "created_at" in data


def test_patient_can_update_own_profile(client, patient_data):
    register_patient(client, patient_data)

    token = login_patient(
        client,
        patient_data["email"],
        patient_data["password"],
    )

    authenticate(client, token)

    response = client.patch(
        "/api/v1/patients/me",
        json={
            "name": "Updated Patient",
            "phone": "9123456789",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "Updated Patient"
    assert data["phone"] == "9123456789"

    profile_response = client.get("/api/v1/patients/me")

    assert profile_response.json()["name"] == "Updated Patient"


def test_empty_profile_update_returns_422(client, patient_data):
    register_patient(client, patient_data)

    token = login_patient(
        client,
        patient_data["email"],
        patient_data["password"],
    )

    authenticate(client, token)

    response = client.patch(
        "/api/v1/patients/me",
        json={},
    )

    assert response.status_code == 422


# --------------------------------------------------
# ASSESSMENT TESTS
# --------------------------------------------------

def test_assessment_creation_requires_authentication(
    client,
    valid_patient,
):
    response = client.post(
        "/api/v1/assessments",
        json={
            "patient": valid_patient,
            "threshold": 0.5,
        },
    )

    assert response.status_code == 401


def test_patient_can_create_assessment(
    client,
    patient_data,
    valid_patient,
    monkeypatch,
):
    from app.api.v1.endpoints import assessments

    monkeypatch.setattr(
        assessments,
        "get_prediction",
        mock_prediction,
    )

    register_patient(client, patient_data)

    token = login_patient(
        client,
        patient_data["email"],
        patient_data["password"],
    )

    authenticate(client, token)

    response = client.post(
        "/api/v1/assessments",
        json={
            "patient": valid_patient,
            "threshold": 0.5,
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["patient_id"] > 0
    assert data["prediction"] == 0
    assert data["prediction_label"] == "negative_class"
    assert data["positive_probability"] == 0.3762
    assert data["model_name"] == "Random Forest"


def test_patient_can_view_assessment_history(
    client,
    patient_data,
    valid_patient,
    monkeypatch,
):
    from app.api.v1.endpoints import assessments

    monkeypatch.setattr(
        assessments,
        "get_prediction",
        mock_prediction,
    )

    register_patient(client, patient_data)

    token = login_patient(
        client,
        patient_data["email"],
        patient_data["password"],
    )

    authenticate(client, token)

    client.post(
        "/api/v1/assessments",
        json={"patient": valid_patient},
    )

    response = client.get("/api/v1/assessments")

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 1
    assert len(data["assessments"]) == 1
    assert data["assessments"][0]["prediction"] == 0


def test_patient_can_view_own_assessment(
    client,
    patient_data,
    valid_patient,
    monkeypatch,
):
    from app.api.v1.endpoints import assessments

    monkeypatch.setattr(
        assessments,
        "get_prediction",
        mock_prediction,
    )

    register_patient(client, patient_data)

    token = login_patient(
        client,
        patient_data["email"],
        patient_data["password"],
    )

    authenticate(client, token)

    create_response = client.post(
        "/api/v1/assessments",
        json={"patient": valid_patient},
    )

    assessment_id = create_response.json()["id"]

    response = client.get(
        f"/api/v1/assessments/{assessment_id}"
    )

    assert response.status_code == 200
    assert response.json()["id"] == assessment_id


def test_patient_cannot_access_another_patients_assessment(
    client,
    patient_data,
    valid_patient,
    monkeypatch,
):
    from app.api.v1.endpoints import assessments

    monkeypatch.setattr(
        assessments,
        "get_prediction",
        mock_prediction,
    )

    # Register first patient.
    first_patient = patient_data.copy()

    register_patient(client, first_patient)

    first_token = login_patient(
        client,
        first_patient["email"],
        first_patient["password"],
    )

    authenticate(client, first_token)

    # Create assessment for first patient.
    create_response = client.post(
        "/api/v1/assessments",
        json={"patient": valid_patient},
    )

    assert create_response.status_code == 201

    assessment_id = create_response.json()["id"]

    # Register second patient.
    second_patient = {
        **patient_data,
        "name": "Second Patient",
        "email": "secondpatient@example.com",
        "phone": "9123456789",
    }

    register_patient(client, second_patient)

    second_token = login_patient(
        client,
        second_patient["email"],
        second_patient["password"],
    )

    authenticate(client, second_token)

    # Second patient must not access first patient's assessment.
    response = client.get(
        f"/api/v1/assessments/{assessment_id}"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Assessment not found."


def test_assessment_history_is_patient_specific(
    client,
    patient_data,
    valid_patient,
    monkeypatch,
):
    from app.api.v1.endpoints import assessments

    monkeypatch.setattr(
        assessments,
        "get_prediction",
        mock_prediction,
    )

    first_patient = patient_data.copy()
    register_patient(client, first_patient)

    first_token = login_patient(
        client,
        first_patient["email"],
        first_patient["password"],
    )

    authenticate(client, first_token)

    client.post(
        "/api/v1/assessments",
        json={"patient": valid_patient},
    )

    # Register and authenticate second patient.
    second_patient = {
        **patient_data,
        "name": "Second Patient",
        "email": "secondpatient@example.com",
        "phone": "9123456789",
    }

    register_patient(client, second_patient)

    second_token = login_patient(
        client,
        second_patient["email"],
        second_patient["password"],
    )

    authenticate(client, second_token)

    response = client.get("/api/v1/assessments")

    assert response.status_code == 200
    assert response.json()["total"] == 0
    assert response.json()["assessments"] == []
