from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class PatientFeatures(BaseModel):
    model_config = ConfigDict(extra="forbid")

    age: Optional[float] = Field(default=None, ge=0, le=120)
    trestbps: Optional[float] = Field(default=None, ge=0)
    chol: Optional[float] = Field(default=None, ge=0)
    thalach: Optional[float] = Field(default=None, ge=0)
    oldpeak: Optional[float] = None

    sex: Optional[int] = None
    cp: Optional[int] = None
    fbs: Optional[int] = None
    restecg: Optional[int] = None
    exang: Optional[int] = None
    slope: Optional[int] = None
    ca: Optional[float] = None
    thal: Optional[int] = None


class PredictionRequest(BaseModel):
    patient: PatientFeatures
    threshold: float = Field(default=0.5, ge=0, le=1)


class PredictionResponse(BaseModel):
    prediction: int
    prediction_label: str
    positive_probability: float
    threshold: float
    model_name: str