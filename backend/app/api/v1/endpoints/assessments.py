
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_patient
from app.db.session import get_db
from app.models.assessment import Assessment
from app.models.patient import Patient
from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentHistoryResponse,
    AssessmentResponse,
)
from app.services.prediction_service import get_prediction


router = APIRouter(
    prefix="/assessments",
    tags=["Assessments"],
)


@router.post(
    "",
    response_model=AssessmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_assessment(
    request: AssessmentCreate,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Run an ML prediction and save it for the authenticated patient."""

    patient_data = request.patient.model_dump()

    try:
        result = get_prediction(
            patient_data=patient_data,
            threshold=request.threshold,
        )

        assessment = Assessment(
            patient_id=current_patient.id,
            **patient_data,
            prediction=result["prediction"],
            prediction_label=result["prediction_label"],
            positive_probability=result["positive_probability"],
            threshold=result["threshold"],
            model_name=result["model_name"],
        )

        db.add(assessment)
        db.commit()
        db.refresh(assessment)

        return assessment

    except ValueError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error

    except FileNotFoundError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Prediction model is unavailable.",
        ) from error

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create and save assessment.",
        )


@router.get(
    "",
    response_model=AssessmentHistoryResponse,
)
def get_assessment_history(
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    """Retrieve assessment history belonging to the authenticated patient."""

    base_query = select(Assessment).where(
        Assessment.patient_id == current_patient.id
    )

    total = db.scalar(
        select(func.count()).select_from(
            base_query.subquery()
        )
    ) or 0

    assessments = db.scalars(
        base_query
        .order_by(Assessment.created_at.desc(), Assessment.id.desc())
        .offset(offset)
        .limit(limit)
    ).all()

    return AssessmentHistoryResponse(
        total=total,
        limit=limit,
        offset=offset,
        assessments=assessments,
    )


@router.get(
    "/{assessment_id}",
    response_model=AssessmentResponse,
)
def get_assessment(
    assessment_id: int,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Retrieve one assessment belonging to the authenticated patient."""

    assessment = db.scalar(
        select(Assessment).where(
            Assessment.id == assessment_id,
            Assessment.patient_id == current_patient.id,
        )
    )

    if assessment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found.",
        )

    return assessment
