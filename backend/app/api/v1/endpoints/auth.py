
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_patient
from app.core.security import (
    create_access_token,
    generate_reset_token,
    hash_password,
    hash_reset_token,
    verify_password,
)
from app.db.session import get_db
from app.models.password_reset import PasswordResetToken
from app.models.patient import Patient
from app.schemas.auth import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginResponse,
    PatientLogin,
    PatientRegister,
    PatientResponse,
    RegistrationResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
)
from app.services.email_service import send_password_reset_email


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


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
    status_code=status.HTTP_200_OK,
)
def request_password_reset(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Request a password reset link.
    Returns a generic message to prevent email enumeration.
    In non-production environments, also returns debug_token for local testing.
    """
    email = str(request.email).lower().strip()
    generic_message = (
        "If an account exists with this email address, a password reset link has been generated."
    )

    patient = db.scalar(
        select(Patient).where(Patient.email == email)
    )

    debug_token: str | None = None

    if patient:
        # Invalidate any existing unused reset tokens for this patient
        existing_tokens = db.scalars(
            select(PasswordResetToken).where(
                PasswordResetToken.patient_id == patient.id,
                PasswordResetToken.is_used == False,  # noqa: E712
            )
        ).all()
        for t in existing_tokens:
            t.is_used = True

        raw_token = generate_reset_token()
        token_hash = hash_reset_token(raw_token)
        expires_at = datetime.now(timezone.utc) + timedelta(
            minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
        )

        db_token = PasswordResetToken(
            patient_id=patient.id,
            token_hash=token_hash,
            expires_at=expires_at,
            is_used=False,
        )
        db.add(db_token)
        db.commit()

        # Send email or log to console
        send_password_reset_email(patient.email, raw_token)

        if settings.ENVIRONMENT != "production":
            debug_token = raw_token

    return ForgotPasswordResponse(
        message=generic_message,
        debug_token=debug_token,
    )


@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse,
    status_code=status.HTTP_200_OK,
)
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Reset password using a valid, unused, non-expired reset token.
    """
    raw_token = request.token.strip()
    token_hash = hash_reset_token(raw_token)

    db_token = db.scalar(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == token_hash,
        )
    )

    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token.",
        )

    if db_token.is_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset token has already been used.",
        )

    now_utc = datetime.now(timezone.utc)
    token_expires_at = db_token.expires_at
    if token_expires_at.tzinfo is None:
        token_expires_at = token_expires_at.replace(tzinfo=timezone.utc)

    if now_utc > token_expires_at:
        db_token.is_used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset token has expired. Please request a new one.",
        )

    patient = db.scalar(
        select(Patient).where(Patient.id == db_token.patient_id)
    )

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated patient account not found.",
        )

    # Hash new password using existing password hashing
    patient.hashed_password = hash_password(request.new_password)
    db_token.is_used = True

    # Invalidate any other tokens for this patient
    other_tokens = db.scalars(
        select(PasswordResetToken).where(
            PasswordResetToken.patient_id == patient.id,
            PasswordResetToken.is_used == False,  # noqa: E712
        )
    ).all()
    for t in other_tokens:
        t.is_used = True

    db.commit()

    return ResetPasswordResponse(
        message="Password has been reset successfully. You can now log in with your new password.",
    )
