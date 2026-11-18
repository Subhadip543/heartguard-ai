
from datetime import datetime

from sqlalchemy import DateTime, Float, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    phone: Mapped[str] = mapped_column(String(10), nullable=False)

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # Optional profile & medical details
    blood_group: Mapped[str | None] = mapped_column(String(10), nullable=True)
    height: Mapped[float | None] = mapped_column(Float, nullable=True)
    weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    medical_conditions: Mapped[str | None] = mapped_column(String(500), nullable=True)
    allergies: Mapped[str | None] = mapped_column(String(500), nullable=True)
    medications: Mapped[str | None] = mapped_column(String(500), nullable=True)
    emergency_contact: Mapped[str | None] = mapped_column(String(100), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
