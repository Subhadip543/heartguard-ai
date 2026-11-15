from fastapi import APIRouter

from app.schemas.ai import ChatRequest, ChatResponse
from app.services.ai_service import generate_chat_response

router = APIRouter(prefix="/ai", tags=["AI Assistant"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Chat with HeartGuard AI Assistant",
    description="Educational heart-health assistant backed by Google Gemini API.",
)
async def chat_with_ai(request: ChatRequest) -> ChatResponse:
    return await generate_chat_response(request)
