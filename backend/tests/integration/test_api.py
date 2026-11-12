
import pytest
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


@pytest.fixture
def valid_patient():
    return {
        "age": 63,
        "trestbps": 145,
        "chol": 233,
        "thalach": 150,
        "oldpeak": 2.3,
        "sex": 1,
        "cp": 1,
        "fbs": 1,
        "restecg": 2,
        "exang": 0,
        "slope": 3,
        "ca": 0,
        "thal": 6,
    }


# --------------------------------------------------
# HEALTH ENDPOINT
# --------------------------------------------------

def test_health_endpoint():
    response = client.get("/api/v1/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "healthy"
    assert data["service"] == "heartguard-ai-api"


# --------------------------------------------------
# VALID PREDICTION
# --------------------------------------------------

def test_valid_prediction_request(valid_patient):
    response = client.post(
        "/api/v1/predict",
        json={
            "patient": valid_patient,
            "threshold": 0.5,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["prediction"] in [0, 1]

    assert data["prediction_label"] in [
        "positive_class",
        "negative_class",
    ]

    assert 0 <= data["positive_probability"] <= 1
    assert data["threshold"] == 0.5
    assert data["model_name"] == "Random Forest"


def test_prediction_response_schema(valid_patient):
    response = client.post(
        "/api/v1/predict",
        json={"patient": valid_patient},
    )

    assert response.status_code == 200

    data = response.json()

    expected_fields = {
        "prediction",
        "prediction_label",
        "positive_probability",
        "threshold",
        "model_name",
    }

    assert set(data.keys()) == expected_fields


# --------------------------------------------------
# INPUT VALIDATION
# --------------------------------------------------

def test_invalid_categorical_value_returns_422(valid_patient):
    valid_patient["sex"] = 99

    response = client.post(
        "/api/v1/predict",
        json={"patient": valid_patient},
    )

    assert response.status_code == 422


def test_invalid_threshold_returns_422(valid_patient):
    response = client.post(
        "/api/v1/predict",
        json={
            "patient": valid_patient,
            "threshold": 1.5,
        },
    )

    assert response.status_code == 422


def test_negative_age_returns_422(valid_patient):
    valid_patient["age"] = -5

    response = client.post(
        "/api/v1/predict",
        json={"patient": valid_patient},
    )

    assert response.status_code == 422


def test_unexpected_patient_feature_returns_422(valid_patient):
    valid_patient["unknown_feature"] = 123

    response = client.post(
        "/api/v1/predict",
        json={"patient": valid_patient},
    )

    assert response.status_code == 422


def test_missing_patient_object_returns_422():
    response = client.post(
        "/api/v1/predict",
        json={},
    )

    assert response.status_code == 422


# --------------------------------------------------
# MODEL AVAILABILITY
# --------------------------------------------------

def test_unavailable_model_returns_503(
    valid_patient,
    monkeypatch,
):
    from app.api.v1.endpoints import predict

    def mock_get_prediction(*args, **kwargs):
        raise FileNotFoundError("Model unavailable")

    monkeypatch.setattr(
        predict,
        "get_prediction",
        mock_get_prediction,
    )

    response = client.post(
        "/api/v1/predict",
        json={"patient": valid_patient},
    )

    assert response.status_code == 503

    assert response.json()["detail"] == (
        "Prediction model is unavailable."
    )
