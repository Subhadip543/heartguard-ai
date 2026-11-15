
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.prediction import PredictionRequest


class AssessmentCreate(PredictionRequest):
    """Input for an authenticated assessment."""

    pass


class AssessmentResponse(BaseModel):
    id: int
    patient_id: int

    age: float | None
    sex: int | None
    cp: int | None
    trestbps: float | None
    chol: float | None
    fbs: int | None
    restecg: int | None
    thalach: float | None
    exang: int | None
    oldpeak: float | None
    slope: int | None
    ca: float | None
    thal: int | None

    prediction: int
    prediction_label: str
    positive_probability: float
    threshold: float
    model_name: str

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AssessmentHistoryResponse(BaseModel):
    total: int
    limit: int
    offset: int
    assessments: list[AssessmentResponse]
