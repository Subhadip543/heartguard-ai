
from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, predict


api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(predict.router)
api_router.include_router(auth.router)
