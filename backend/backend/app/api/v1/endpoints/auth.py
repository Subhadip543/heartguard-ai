
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.patient import Patient
from app.schemas.auth import PatientRegister, RegistrationResponse
from app.core.security import hash_password


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=RegistrationResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_patient(
    patient_data: PatientRegister,
    db: Session = Depends(get_db),
):
    existing_patient = db.scalar(
        select(Patient).where(Patient.email == patient_data.email)
    )

    if existing_patient:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    patient = Patient(
        name=patient_data.name,
        email=str(patient_data.email).lower(),
        phone=patient_data.phone,
        hashed_password=hash_password(patient_data.password),
    )

    db.add(patient)

    try:
        db.commit()
        db.refresh(patient)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    return RegistrationResponse(
        message="Registration successful.",
        patient=patient,
    )
