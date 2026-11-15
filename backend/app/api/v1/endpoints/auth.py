
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_patient
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.db.session import get_db
from app.models.patient import Patient
from app.schemas.auth import (
    LoginResponse,
    PatientLogin,
    PatientRegister,
    PatientResponse,
    RegistrationResponse,
)


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
    email = str(patient_data.email).lower()

    existing_patient = db.scalar(
        select(Patient).where(Patient.email == email)
    )

    if existing_patient:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    patient = Patient(
        name=patient_data.name,
        email=email,
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


@router.post(
    "/login",
    response_model=LoginResponse,
)
def login_patient(
    login_data: PatientLogin,
    db: Session = Depends(get_db),
):
    email = str(login_data.email).lower()

    patient = db.scalar(
        select(Patient).where(Patient.email == email)
    )

    if not patient or not verify_password(
        login_data.password,
        patient.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(str(patient.id))

    return LoginResponse(
        message="Login successful.",
        token=token,
        patient=patient,
    )


@router.get(
    "/me",
    response_model=PatientResponse,
)
def get_my_profile(
    current_patient: Patient = Depends(get_current_patient),
):
    """
    Return the currently authenticated patient's profile.
    """
    return current_patient
