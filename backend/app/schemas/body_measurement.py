from datetime import date, datetime

from pydantic import BaseModel, Field, model_validator

MEASUREMENT_FIELDS = ("waist_cm", "chest_cm", "hips_cm", "arm_cm", "thigh_cm")


class BodyMeasurementCreate(BaseModel):
    recorded_at: date
    waist_cm: float | None = Field(default=None, gt=0, le=300)
    chest_cm: float | None = Field(default=None, gt=0, le=300)
    hips_cm: float | None = Field(default=None, gt=0, le=300)
    arm_cm: float | None = Field(default=None, gt=0, le=100)
    thigh_cm: float | None = Field(default=None, gt=0, le=150)

    @model_validator(mode="after")
    def require_at_least_one_measurement(self):
        if all(getattr(self, field) is None for field in MEASUREMENT_FIELDS):
            raise ValueError("At least one measurement must be provided")
        return self


class BodyMeasurementUpdate(BaseModel):
    recorded_at: date | None = None
    waist_cm: float | None = Field(default=None, gt=0, le=300)
    chest_cm: float | None = Field(default=None, gt=0, le=300)
    hips_cm: float | None = Field(default=None, gt=0, le=300)
    arm_cm: float | None = Field(default=None, gt=0, le=100)
    thigh_cm: float | None = Field(default=None, gt=0, le=150)


class BodyMeasurementRead(BaseModel):
    id: int
    recorded_at: date
    waist_cm: float | None
    chest_cm: float | None
    hips_cm: float | None
    arm_cm: float | None
    thigh_cm: float | None
    created_at: datetime

    model_config = {"from_attributes": True}
