from datetime import datetime

from pydantic import BaseModel, Field

from app.db.models import FitnessGoal


class ProfileUpdate(BaseModel):
    height_cm: float | None = Field(default=None, gt=0, le=300)
    weight_kg: float | None = Field(default=None, gt=0, le=500)
    age: int | None = Field(default=None, gt=0, le=120)
    fitness_goal: FitnessGoal | None = None


class ProfileRead(BaseModel):
    user_id: int
    height_cm: float | None
    weight_kg: float | None
    age: int | None
    fitness_goal: FitnessGoal | None
    updated_at: datetime

    model_config = {"from_attributes": True}
