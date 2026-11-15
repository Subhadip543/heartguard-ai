
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class PatientProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PatientProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    phone: str | None = Field(default=None, pattern=r"^[0-9]{10}$")

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

        for field in self.model_fields_set:
            if getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null.")

        return self
