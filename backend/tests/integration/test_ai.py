import httpx
import pytest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app
from app.services.ai_service import get_system_instruction, sanitize_markdown_syntax


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
        assert "unconfigured" in data["detail"].lower() or "unavailable" in data["detail"].lower()


def test_ai_chat_invalid_payload_returns_422(client):
    """Validation fails for empty messages or whitespace-only messages."""
    response = client.post(
        "/api/v1/ai/chat",
        json={"message": ""},
    )
    assert response.status_code == 422

    response_ws = client.post(
        "/api/v1/ai/chat",
        json={"message": "    "},
    )
    assert response_ws.status_code == 422


def test_ai_chat_long_message_validation(client):
    """Messages up to 2000 characters are accepted; messages > 2000 characters are rejected."""
    long_valid_message = "A" * 2000
    mock_gemini_json = {
        "candidates": [
            {
                "content": {"parts": [{"text": "Long message received."}], "role": "model"},
                "finishReason": "STOP",
            }
        ]
    }
    with patch("app.core.config.settings.GEMINI_API_KEY", "fake_test_key_12345"), \
         patch("httpx.AsyncClient.post", return_value=httpx.Response(200, json=mock_gemini_json)):
        res_valid = client.post(
            "/api/v1/ai/chat",
            json={"message": long_valid_message},
        )
        assert res_valid.status_code == 200

    too_long_message = "A" * 2001
    res_invalid = client.post(
        "/api/v1/ai/chat",
        json={"message": too_long_message},
    )
    assert res_invalid.status_code == 422


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
        assert data["model"] == "gemini-3.5-flash-lite"


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


def test_ai_chat_upstream_503_retry_succeeds(client):
    """When upstream Gemini API returns 503 on first try, retry succeeds."""
    mock_503 = httpx.Response(503, json={"error": "overloaded"})
    mock_200 = httpx.Response(
        200,
        json={
            "candidates": [
                {
                    "content": {
                        "parts": [{"text": "Heart disease is preventable."}],
                        "role": "model",
                    },
                    "finishReason": "STOP",
                }
            ]
        },
    )

    with patch("app.core.config.settings.GEMINI_API_KEY", "fake_test_key_12345"), \
         patch("httpx.AsyncClient.post", side_effect=[mock_503, mock_200]), \
         patch("asyncio.sleep", new_callable=AsyncMock) as mock_sleep:
        response = client.post(
            "/api/v1/ai/chat",
            json={"message": "Is heart disease preventable?"},
        )
        assert response.status_code == 200
        assert "Heart disease is preventable" in response.json()["reply"]
        assert mock_sleep.await_count == 1


def test_ai_chat_upstream_503_retry_exhausted_returns_503(client):
    """When upstream Gemini API returns 503 on both tries, endpoint returns 503."""
    mock_503 = httpx.Response(503, json={"error": "overloaded"})

    with patch("app.core.config.settings.GEMINI_API_KEY", "fake_test_key_12345"), \
         patch("httpx.AsyncClient.post", return_value=mock_503), \
         patch("asyncio.sleep", new_callable=AsyncMock) as mock_sleep:
        response = client.post(
            "/api/v1/ai/chat",
            json={"message": "What is tachycardia?"},
        )
        assert response.status_code == 503
        assert "high demand" in response.json()["detail"].lower()
        assert mock_sleep.await_count == 1


def test_ai_chat_upstream_429_rate_limit_returns_429_without_retry(client):
    """When upstream Gemini API returns 429, returns 429 immediately without retry."""
    mock_429 = httpx.Response(429, json={"error": "rate limit"})

    with patch("app.core.config.settings.GEMINI_API_KEY", "fake_test_key_12345"), \
         patch("httpx.AsyncClient.post", return_value=mock_429), \
         patch("asyncio.sleep", new_callable=AsyncMock) as mock_sleep:
        response = client.post(
            "/api/v1/ai/chat",
            json={"message": "What is cholesterol?"},
        )
        assert response.status_code == 429
        assert "usage limit" in response.json()["detail"].lower()
        assert mock_sleep.await_count == 0


def test_ai_chat_upstream_403_returns_502(client):
    """When upstream Gemini API returns 403, returns 502 without exposing keys."""
    mock_403 = httpx.Response(403, json={"error": "forbidden"})

    with patch("app.core.config.settings.GEMINI_API_KEY", "fake_test_key_12345"), \
         patch("httpx.AsyncClient.post", return_value=mock_403):
        response = client.post(
            "/api/v1/ai/chat",
            json={"message": "What is cholesterol?"},
        )
        assert response.status_code == 502
        assert "authenticate" in response.json()["detail"].lower()


def test_ai_chat_safety_blocked_candidate(client):
    """When Gemini returns SAFETY finish reason, returns safe educational disclaimer."""
    mock_gemini_json = {
        "candidates": [
            {
                "content": {"parts": [{"text": ""}], "role": "model"},
                "finishReason": "SAFETY",
            }
        ]
    }
    mock_response = httpx.Response(200, json=mock_gemini_json)

    with patch("app.core.config.settings.GEMINI_API_KEY", "fake_test_key_12345"), \
         patch("httpx.AsyncClient.post", return_value=mock_response):
        response = client.post(
            "/api/v1/ai/chat",
            json={"message": "Unsafe query"},
        )
        assert response.status_code == 200
        assert "safety considerations" in response.json()["reply"]


def test_ai_chat_core_heart_health_questions(client):
    """Test standard heart health inquiries execute cleanly through the chat endpoint."""
    test_questions = [
        "What is the difference between a heart attack and cardiac arrest?",
        "How can I keep my heart healthy?",
        "What is hypertension?",
        "How does cholesterol affect heart health?",
        "What are the common warning signs of a heart attack?",
    ]

    for question in test_questions:
        mock_gemini_json = {
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {"text": f"## Heart Health Information\n\nEducational response for: {question}"}
                        ],
                        "role": "model",
                    },
                    "finishReason": "STOP",
                }
            ]
        }
        with patch("app.core.config.settings.GEMINI_API_KEY", "fake_test_key_12345"), \
             patch("httpx.AsyncClient.post", return_value=httpx.Response(200, json=mock_gemini_json)):
            res = client.post(
                "/api/v1/ai/chat",
                json={"message": question, "history": []},
            )
            assert res.status_code == 200
            data = res.json()
            assert question in data["reply"]
            assert data["model"] == "gemini-3.5-flash-lite"


def test_ai_chat_follow_up_conversation_context(client):
    """Verify follow-up questions referencing previous answers pass history properly."""
    history = [
        {"role": "user", "content": "What is hypertension?"},
        {
            "role": "assistant",
            "content": "Hypertension is high blood pressure, typically 130/80 mmHg or higher.",
        },
    ]
    follow_up_question = "What lifestyle changes can help manage it?"

    mock_gemini_json = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": "### Managing Hypertension\n\n- Reduce sodium intake\n- Exercise regularly\n- Maintain healthy weight"
                        }
                    ],
                    "role": "model",
                },
                "finishReason": "STOP",
            }
        ]
    }

    with patch("app.core.config.settings.GEMINI_API_KEY", "fake_test_key_12345"), \
         patch("httpx.AsyncClient.post", return_value=httpx.Response(200, json=mock_gemini_json)) as mock_post:
        res = client.post(
            "/api/v1/ai/chat",
            json={"message": follow_up_question, "history": history},
        )
        assert res.status_code == 200
        assert "Managing Hypertension" in res.json()["reply"]

        # Verify sent payload contained formatted history turns
        called_json = mock_post.call_args[1]["json"]
        contents = called_json["contents"]
        assert len(contents) >= 3
        assert contents[0]["role"] == "user"
        assert "What is hypertension?" in contents[0]["parts"][0]["text"]
        assert contents[1]["role"] == "model"
        assert contents[2]["role"] == "user"
        assert follow_up_question in contents[2]["parts"][0]["text"]


def test_system_instruction_medical_safety_and_identity():
    """Verify system instruction contains unified identity, 112 emergency, and safety rules."""
    instruction = get_system_instruction("English")
    assert "HeartGuard AI — Your Educational Cardiovascular Health Assistant" in instruction
    assert "112" in instruction
    assert "NOT a medical doctor" in instruction
    assert "Never diagnose" in instruction
    assert "Never prescribe" in instruction
    assert "Random Forest" in instruction
    assert "Markdown" in instruction


def test_sanitize_markdown_syntax():
    """Verify escaped markdown syntax characters are unescaped safely."""
    raw = r"\### Heart Health Overview\n\n\*\*Blood pressure\*\* is important. Check \*this\* list:\n\- Item 1"
    cleaned = sanitize_markdown_syntax(raw)
    assert r"\###" not in cleaned
    assert "###" in cleaned
    assert r"\*\*" not in cleaned
    assert "**" in cleaned
    assert r"\-" not in cleaned
    assert "- Item 1" in cleaned

    # Verify regular backslashes that are not markdown delimiters are not destroyed
    code_snippet = r"value = \alpha + \beta"
    assert sanitize_markdown_syntax(code_snippet) == code_snippet
