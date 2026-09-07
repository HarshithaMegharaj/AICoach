from datetime import date, datetime

from pydantic import BaseModel, Field


class WeightEntryCreate(BaseModel):
    recorded_at: date
    weight_kg: float = Field(gt=0, le=500)


class WeightEntryUpdate(BaseModel):
    recorded_at: date | None = None
    weight_kg: float | None = Field(default=None, gt=0, le=500)


class WeightEntryRead(BaseModel):
    id: int
    recorded_at: date
    weight_kg: float
    created_at: datetime

    model_config = {"from_attributes": True}
