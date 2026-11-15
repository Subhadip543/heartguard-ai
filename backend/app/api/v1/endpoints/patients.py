
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_patient
from app.db.session import get_db
from app.models.patient import Patient
from app.schemas.patient import (
    PatientProfileResponse,
    PatientProfileUpdate,
)


router = APIRouter(prefix="/patients", tags=["Patients"])


@router.get(
    "/me",
    response_model=PatientProfileResponse,
)
def get_my_profile(
    current_patient: Patient = Depends(get_current_patient),
):
    """Retrieve the authenticated patient's profile."""
    return current_patient


@router.patch(
    "/me",
    response_model=PatientProfileResponse,
)
def update_my_profile(
    profile_data: PatientProfileUpdate,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Update the authenticated patient's own profile."""

    update_data = profile_data.model_dump(exclude_unset=True)

    try:
        for field, value in update_data.items():
            setattr(current_patient, field, value)

        db.add(current_patient)
        db.commit()
        db.refresh(current_patient)

        return current_patient

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update patient profile.",
        )
