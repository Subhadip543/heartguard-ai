
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Patient input features
    age: Mapped[float | None] = mapped_column(Float, nullable=True)
    sex: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cp: Mapped[int | None] = mapped_column(Integer, nullable=True)
    trestbps: Mapped[float | None] = mapped_column(Float, nullable=True)
    chol: Mapped[float | None] = mapped_column(Float, nullable=True)
    fbs: Mapped[int | None] = mapped_column(Integer, nullable=True)
    restecg: Mapped[int | None] = mapped_column(Integer, nullable=True)
    thalach: Mapped[float | None] = mapped_column(Float, nullable=True)
    exang: Mapped[int | None] = mapped_column(Integer, nullable=True)
    oldpeak: Mapped[float | None] = mapped_column(Float, nullable=True)
    slope: Mapped[int | None] = mapped_column(Integer, nullable=True)
    ca: Mapped[float | None] = mapped_column(Float, nullable=True)
    thal: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # ML prediction output
    prediction: Mapped[int] = mapped_column(Integer, nullable=False)
    prediction_label: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    positive_probability: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    threshold: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    model_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    __table_args__ = (
        Index("ix_assessments_patient_created", "patient_id", "created_at"),
    )
