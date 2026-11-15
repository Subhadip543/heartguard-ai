import logging
import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.schemas.ai import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)

GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"


def get_system_instruction(language: str = "English") -> str:
    return (
        "You are HeartGuard AI Assistant, an educational cardiovascular health guide. "
        "Your purpose is to provide clear, helpful, evidence-based educational information about heart health, "
        "prevention, lifestyle, nutrition, and cardiovascular concepts.\n\n"
        "STRICT SAFETY BOUNDARIES:\n"
        "1. You are NOT a medical doctor. You must NEVER diagnose medical conditions or prescribe medications, treatments, or specific drug dosages.\n"
        "2. Always clarify that your advice is for educational purposes only and cannot replace clinical evaluation by a qualified healthcare professional.\n"
        "3. EMERGENCY DETECTION: If the user describes or asks about severe or potential cardiac emergency symptoms "
        "— such as crushing or pressing chest pain/tightness, pain radiating to the arm, neck, back, or jaw, "
        "severe sudden shortness of breath, unexplained fainting or loss of consciousness, sudden numbness, weakness, or difficulty speaking — "
        "you MUST immediately urge them to seek emergency medical attention without delay (e.g., call 112, 911, or their local emergency services).\n"
        "4. For personalized clinical risk assessment, remind users to use HeartGuard's 13-feature Random Forest Heart Risk Assessment tool or consult their doctor.\n"
        f"5. Answer helpfully in the user's preferred language ({language}) in an empathetic, clear, structured, and reassuring tone."
    )


def format_gemini_contents(request: ChatRequest) -> list[dict]:
    """
    Format message history and current user prompt into valid Gemini contents.
    Ensures alternating user/model roles and non-empty content parts.
    """
    contents: list[dict] = []

    for item in request.history:
        text = item.content.strip()
        if not text:
            continue

        role = "model" if item.role in ("assistant", "model") else "user"

        if contents and contents[-1]["role"] == role:
            contents[-1]["parts"][0]["text"] += "\n\n" + text
        else:
            contents.append({"role": role, "parts": [{"text": text}]})

    # Gemini requires conversation to begin with a user turn
    while contents and contents[0]["role"] != "user":
        contents.pop(0)

    current_msg = request.message.strip()
    if contents and contents[-1]["role"] == "user":
        contents[-1]["parts"][0]["text"] += "\n\n" + current_msg
    else:
        contents.append({"role": "user", "parts": [{"text": current_msg}]})

    return contents


async def generate_chat_response(request: ChatRequest) -> ChatResponse:
    """
    Generate an educational heart-health chat response via Google Gemini API.
    Calls Gemini from backend only and never exposes API key.
    """
    api_key = settings.effective_gemini_api_key
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI assistant service is currently unconfigured. GEMINI_API_KEY is not set on the server.",
        )

    model_name = settings.GEMINI_MODEL or "gemini-1.5-flash"
    url = f"{GEMINI_API_BASE_URL}/{model_name}:generateContent"

    system_text = get_system_instruction(request.language)
    formatted_contents = format_gemini_contents(request)

    payload = {
        "system_instruction": {
            "parts": [{"text": system_text}]
        },
        "contents": formatted_contents,
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 1024,
        },
    }

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key,
    }

    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            response = await client.post(url, headers=headers, json=payload)
    except httpx.TimeoutException:
        logger.warning("Gemini AI request timed out after 25 seconds.")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="The AI assistant service timed out while generating a response. Please try again.",
        )
    except httpx.RequestError as exc:
        logger.error("Network error while connecting to Gemini: %s", type(exc).__name__)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to reach the AI assistant service. Please check your network connection and try again.",
        )

    if response.status_code == 429:
        logger.warning("Gemini API rate limit reached.")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="AI assistant is receiving high traffic. Please try again in a moment.",
        )

    if response.status_code != 200:
        logger.error("Gemini API returned upstream status code: %s", response.status_code)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI assistant service encountered an upstream provider error. Please try again later.",
        )

    try:
        data = response.json()
    except Exception as exc:
        logger.error("Failed to decode Gemini JSON response: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Received an invalid response format from AI assistant service.",
        )

    candidates = data.get("candidates") or []
    if not candidates:
        block_reason = data.get("promptFeedback", {}).get("blockReason")
        if block_reason:
            return ChatResponse(
                reply="This query could not be processed due to safety policies. For any medical concerns, please consult a healthcare professional.",
                model=model_name,
            )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI assistant did not return any response candidates.",
        )

    first_candidate = candidates[0]
    finish_reason = first_candidate.get("finishReason")
    parts = first_candidate.get("content", {}).get("parts", [])
    reply_text = "".join(part.get("text", "") for part in parts).strip()

    if not reply_text:
        if finish_reason == "SAFETY":
            reply_text = "I cannot provide a response to this query due to safety considerations. For health concerns, please consult a medical practitioner."
        else:
            reply_text = "I'm sorry, I could not generate a response. Please try rephrasing your question."

    return ChatResponse(reply=reply_text, model=model_name)
