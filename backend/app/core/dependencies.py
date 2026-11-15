
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import InvalidTokenError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.patient import Patient


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_patient(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Patient:
    """
    Authenticate the request using a JWT and return its patient.
    """

    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required or token is invalid.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise unauthorized

    if credentials.scheme.lower() != "bearer":
        raise unauthorized

    try:
        payload = decode_access_token(credentials.credentials)
        patient_id = payload.get("sub")

        if not isinstance(patient_id, str) or not patient_id.isdigit():
            raise unauthorized

    except (InvalidTokenError, ValueError, TypeError):
        raise unauthorized

    patient = db.scalar(
        select(Patient).where(Patient.id == int(patient_id))
    )

    if patient is None:
        raise unauthorized

    return patient
