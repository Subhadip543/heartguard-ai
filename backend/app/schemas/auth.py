
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class PatientRegister(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(pattern=r"^[0-9]{10}$")
    password: str = Field(min_length=8, max_length=128)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Name cannot be empty.")
        return value


class PatientLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class PatientResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str

    model_config = ConfigDict(from_attributes=True)


class RegistrationResponse(BaseModel):
    message: str
    patient: PatientResponse


class LoginResponse(BaseModel):
    message: str
    token: str
    token_type: str = "bearer"
    patient: PatientResponse
