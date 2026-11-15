from fastapi import APIRouter

from app.api.v1.endpoints import (
    assessments,
    auth,
    health,
    patients,
    predict,
)


api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(predict.router)
api_router.include_router(auth.router)
api_router.include_router(patients.router)
api_router.include_router(assessments.router)
