
from fastapi import APIRouter, HTTPException

from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
)
from app.services.prediction_service import get_prediction

router = APIRouter()


@router.post(
    "/predict",
    response_model=PredictionResponse,
    tags=["Prediction"],
)
def predict_heart_disease(request: PredictionRequest):
    try:
        patient_data = request.patient.model_dump()

        result = get_prediction(
            patient_data=patient_data,
            threshold=request.threshold,
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        ) from error

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=503,
            detail="Prediction model is unavailable.",
        ) from error

