import httpx
import pytest
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_ai_chat_missing_api_key_returns_503(client):
    """When GEMINI_API_KEY is not set, endpoint returns 503 Service Unavailable."""
    with patch("app.core.config.settings.GEMINI_API_KEY", None), \
         patch("app.core.config.settings.GOOGLE_API_KEY", None):
        response = client.post(
            "/api/v1/ai/chat",
            json={"message": "What is hypertension?", "history": []},
        )
        assert response.status_code == 503
        data = response.json()
        assert "unconfigured" in data["detail"].lower()


def test_ai_chat_invalid_payload_returns_422(client):
    """Validation fails for empty messages or invalid structures."""
    response = client.post(
        "/api/v1/ai/chat",
        json={"message": ""},
    )
    assert response.status_code == 422


def test_ai_chat_successful_mocked_gemini_response(client):
    """Successful Gemini API response parses properly and returns reply and model."""
    mock_gemini_json = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {"text": "A healthy heart requires regular exercise, balanced diet, and stress management."}
                    ],
                    "role": "model",
                },
                "finishReason": "STOP",
            }
        ]
    }

    mock_response = httpx.Response(200, json=mock_gemini_json)

    with patch("app.core.config.settings.GEMINI_API_KEY", "fake_test_key_12345"), \
         patch("httpx.AsyncClient.post", return_value=mock_response):
        response = client.post(
            "/api/v1/ai/chat",
            json={
                "message": "How do I keep my heart healthy?",
                "history": [
                    {"role": "user", "content": "Hello"},
                    {"role": "assistant", "content": "Hello! I am your heart health assistant."},
                ],
                "language": "English",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "healthy heart" in data["reply"]
        assert data["model"] == "gemini-1.5-flash"


def test_ai_chat_upstream_timeout_returns_504(client):
    """When upstream Gemini API times out, endpoint returns 504 Gateway Timeout."""
    with patch("app.core.config.settings.GEMINI_API_KEY", "fake_test_key_12345"), \
         patch("httpx.AsyncClient.post", side_effect=httpx.TimeoutException("Timeout")):
        response = client.post(
            "/api/v1/ai/chat",
            json={"message": "What causes heart failure?"},
        )
        assert response.status_code == 504
        assert "timed out" in response.json()["detail"].lower()


def test_ai_chat_upstream_error_returns_502(client):
    """When upstream Gemini API returns non-200, endpoint returns 502 Bad Gateway."""
    mock_response = httpx.Response(500, json={"error": "internal error"})

    with patch("app.core.config.settings.GEMINI_API_KEY", "fake_test_key_12345"), \
         patch("httpx.AsyncClient.post", return_value=mock_response):
        response = client.post(
            "/api/v1/ai/chat",
            json={"message": "What causes heart failure?"},
        )
        assert response.status_code == 502
        assert "upstream provider error" in response.json()["detail"].lower()
