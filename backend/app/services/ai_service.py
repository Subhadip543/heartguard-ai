import asyncio
import logging
import re
import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.schemas.ai import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)

GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

REQUEST_TIMEOUT = httpx.Timeout(
    timeout=30.0,
    connect=10.0,
)


def get_system_instruction(language: str = "English") -> str:
    return (
        "You are HeartGuard AI — Your Educational Cardiovascular Health Assistant. "
        "Your purpose is to provide clear, helpful, evidence-based educational information about "
        "heart health, cardiovascular diseases, prevention, lifestyle, and nutrition.\n\n"
        "CORE IDENTITY & TONE:\n"
        "- Give clear, structured, and accessible answers.\n"
        "- Explain medical and cardiovascular terminology simply without jargon.\n"
        "- Use standard Markdown formatting: headings (##, ###), bullet lists, bold text (**emphasis**), "
        "and Markdown tables where helpful. Do NOT escape Markdown syntax characters with backslashes.\n"
        "- Avoid unnecessary repetition and avoid excessively long answers for simple queries.\n"
        "- Maintain conversational context across follow-up questions.\n"
        f"- Respond in the user's preferred language ({language}) in an empathetic, professional, and reassuring tone.\n\n"
        "STRICT MEDICAL SAFETY BOUNDARIES:\n"
        "1. You are an educational AI assistant, NOT a medical doctor. Never claim to be a physician or clinical practitioner.\n"
        "2. Never diagnose cardiovascular diseases, personal medical conditions, or interpret personal lab results as a clinical diagnosis.\n"
        "3. Never prescribe medication, recommend specific drug dosages, or advise users to change their prescribed treatments.\n"
        "4. Always encourage professional medical evaluation and consultation with a qualified doctor for concerning symptoms.\n"
        "5. Avoid making unsupported or alarmist claims about a user's personal health.\n"
        "6. Do not make everyday healthy living or general heart-health inquiries unnecessarily alarming.\n"
        "7. EMERGENCY GUIDANCE: For acute, severe, or sudden symptoms suggesting a heart attack, cardiac arrest, or stroke "
        "(such as crushing chest pain or pressure, pain radiating to the jaw, neck, back, or arm, sudden severe shortness of breath, "
        "unexplained fainting, or sudden numbness/weakness/speech difficulty), provide immediate, prominent, and concise emergency advice:\n"
        "   - In India: Call 112 immediately for emergency medical assistance.\n"
        "   - Outside India: Immediately call your local emergency medical number (such as 911 in the US or 999 in the UK) or go to the nearest emergency room.\n"
        "8. HEARTGUARD RISK ASSESSMENT INTEGRATION: When users ask about personal risk assessment or evaluating their risk profile, "
        "inform them about HeartGuard's 13-feature Random Forest Heart Risk Assessment tool available on the platform as an educational risk exploration feature, "
        "and remind them that it provides statistical risk estimation, NOT a clinical diagnosis."
    )


def sanitize_markdown_syntax(text: str) -> str:
    """
    Safely unescapes backslashes preceding Markdown syntax delimiters
    (e.g., \\### -> ###, \\*\\* -> **) without altering file paths or normal backslashes.
    """
    if not text:
        return ""
    return re.sub(r'\\([#*_`>~\[\]\(\)-])', r'\1', text)


def format_gemini_contents(request: ChatRequest) -> list[dict]:
    """
    Format message history and current user prompt into valid Gemini contents.
    Ensures alternating user/model roles and non-empty content parts.
    Gemini Developer API requires conversation to start with a user turn.
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
            contents.append({
                "role": role,
                "parts": [{"text": text}],
            })

    # Gemini conversation must begin with a user turn.
    while contents and contents[0]["role"] != "user":
        contents.pop(0)

    current_msg = request.message.strip()

    if contents and contents[-1]["role"] == "user":
        contents[-1]["parts"][0]["text"] += "\n\n" + current_msg
    elif current_msg:
        contents.append({
            "role": "user",
            "parts": [{"text": current_msg}],
        })

    return contents


async def generate_chat_response(request: ChatRequest) -> ChatResponse:
    """
    Generate an educational heart-health response using Google Gemini.
    Calls Gemini Developer API securely from the backend; credentials are never leaked.
    Distinguishes 429 (quota), 503 (temporary overload), 504 (timeout), 403 (auth), 404 (model).
    Performs at most ONE retry for upstream 503 temporary overload errors.
    """
    api_key = settings.effective_gemini_api_key
    if not api_key:
        logger.error("Gemini API key is not configured.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI assistant service is currently unconfigured or unavailable.",
        )

    model_name = settings.GEMINI_MODEL
    if not model_name:
        logger.error("Gemini model is not configured.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI assistant model is not configured.",
        )

    url = f"{GEMINI_API_BASE_URL}/{model_name}:generateContent"
    system_text = get_system_instruction(request.language)
    formatted_contents = format_gemini_contents(request)

    if not formatted_contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a valid message.",
        )

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

    max_attempts = 2  # Original attempt + at most 1 retry for temporary 503 server errors
    response: httpx.Response | None = None

    for attempt in range(1, max_attempts + 1):
        try:
            async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
                response = await client.post(
                    url,
                    headers=headers,
                    json=payload,
                )
        except httpx.TimeoutException:
            logger.warning("Gemini request timed out. Model: %s", model_name)
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="The AI assistant request timed out. Please try again shortly.",
            )
        except httpx.RequestError as exc:
            logger.error("Gemini connection error: %s", type(exc).__name__)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Unable to connect to the AI assistant. Please try again later.",
            )

        # If temporary 503 server error and this is attempt 1, do at most 1 short retry
        if response.status_code == 503 and attempt < max_attempts:
            logger.warning(
                "Gemini API returned 503 (temporary overload) on attempt %d for model %s. Retrying once after short delay...",
                attempt,
                model_name,
            )
            await asyncio.sleep(1.5)
            continue

        # Otherwise break and handle the response
        break

    if response is None:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI assistant encountered an upstream provider error. Please try again later.",
        )

    # Differentiate HTTP status codes
    if response.status_code == 429:
        logger.warning("Gemini quota or rate limit reached. Model: %s", model_name)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="The AI assistant has reached its current usage limit. Please try again later.",
        )

    if response.status_code == 503:
        logger.error(
            "Gemini API overloaded after attempt. Model: %s | Status: 503",
            model_name,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The AI assistant is temporarily experiencing high demand. Please try again shortly.",
        )

    if response.status_code == 403:
        logger.error("Gemini API authentication failed (403).")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI service could not authenticate the request. Please contact support.",
        )

    if response.status_code == 404:
        logger.error("Gemini model unavailable (404): %s", model_name)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"The configured AI model is unavailable: {model_name}.",
        )

    if response.status_code != 200:
        logger.error(
            "Gemini upstream error. Status: %s, Model: %s",
            response.status_code,
            model_name,
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI assistant encountered an upstream provider error. Please try again later.",
        )

    # Parse JSON response safely
    try:
        data = response.json()
    except ValueError:
        logger.error("Gemini returned invalid JSON.")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Received an invalid response format from the AI service.",
        )

    candidates = data.get("candidates") or []
    if not candidates:
        block_reason = data.get("promptFeedback", {}).get("blockReason")
        if block_reason:
            logger.warning("Gemini blocked the prompt. Reason: %s", block_reason)
            return ChatResponse(
                reply=(
                    "This query could not be processed due to safety policies. "
                    "For any medical concerns, please consult a healthcare professional."
                ),
                model=model_name,
            )

        logger.warning("Gemini returned no response candidates.")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI assistant did not generate a response.",
        )

    first_candidate = candidates[0]
    finish_reason = first_candidate.get("finishReason")
    parts = first_candidate.get("content", {}).get("parts", [])
    raw_reply_text = "".join(part.get("text", "") for part in parts).strip()

    if not raw_reply_text:
        if finish_reason == "SAFETY":
            reply_text = (
                "I cannot provide a response to this query due to safety considerations. "
                "For health concerns, please consult a medical practitioner."
            )
        else:
            logger.warning("Gemini returned empty text. Finish reason: %s", finish_reason)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="The AI assistant could not generate a response. Please try rephrasing your question.",
            )
    else:
        reply_text = sanitize_markdown_syntax(raw_reply_text)

    logger.info("Gemini response generated successfully. Model: %s", model_name)
    return ChatResponse(
        reply=reply_text,
        model=model_name,
    )
