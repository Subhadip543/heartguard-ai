
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class PatientProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    blood_group: str | None = None
    height: float | None = None
    weight: float | None = None
    medical_conditions: str | None = None
    allergies: str | None = None
    medications: str | None = None
    emergency_contact: str | None = None
    city: str | None = None
    address: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PatientProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    phone: str | None = Field(default=None, pattern=r"^[0-9]{10}$")
    blood_group: str | None = Field(default=None, max_length=10)
    height: float | None = Field(default=None, ge=30, le=300)
    weight: float | None = Field(default=None, ge=10, le=500)
    medical_conditions: str | None = Field(default=None, max_length=500)
    allergies: str | None = Field(default=None, max_length=500)
    medications: str | None = Field(default=None, max_length=500)
    emergency_contact: str | None = Field(default=None, max_length=100)
    city: str | None = Field(default=None, max_length=100)
    address: str | None = Field(default=None, max_length=255)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        if value is None:
            return value

        value = value.strip()

        if not value:
            raise ValueError("Name cannot be empty.")

        return value

    @model_validator(mode="after")
    def validate_at_least_one_field(self):
        if not self.model_fields_set:
            raise ValueError("Provide at least one field to update.")

        for required_field in ("name", "phone"):
            if required_field in self.model_fields_set and getattr(self, required_field) is None:
                raise ValueError(f"{required_field} cannot be null.")

        return self
