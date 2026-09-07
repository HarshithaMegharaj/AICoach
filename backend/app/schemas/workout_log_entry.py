from datetime import date, datetime

from pydantic import BaseModel, Field

from app.schemas.exercise import ExerciseRead


class WorkoutLogEntryCreate(BaseModel):
    exercise_id: int
    logged_at: date
    sets: int = Field(gt=0, le=50)
    reps: int = Field(gt=0, le=1000)
    weight_kg: float | None = Field(default=None, ge=0, le=500)
    notes: str | None = Field(default=None, max_length=500)


class WorkoutLogEntryUpdate(BaseModel):
    exercise_id: int | None = None
    logged_at: date | None = None
    sets: int | None = Field(default=None, gt=0, le=50)
    reps: int | None = Field(default=None, gt=0, le=1000)
    weight_kg: float | None = Field(default=None, ge=0, le=500)
    notes: str | None = Field(default=None, max_length=500)


class WorkoutLogEntryRead(BaseModel):
    id: int
    exercise: ExerciseRead
    logged_at: date
    sets: int
    reps: int
    weight_kg: float | None
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
