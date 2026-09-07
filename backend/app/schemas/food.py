from datetime import datetime

from pydantic import BaseModel, Field


class FoodCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    serving_size: str = Field(min_length=1, max_length=100)
    calories_per_serving: float = Field(gt=0, le=10000)
    protein_g: float | None = Field(default=None, ge=0, le=1000)
    carbs_g: float | None = Field(default=None, ge=0, le=1000)
    fat_g: float | None = Field(default=None, ge=0, le=1000)


class FoodUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    serving_size: str | None = Field(default=None, min_length=1, max_length=100)
    calories_per_serving: float | None = Field(default=None, gt=0, le=10000)
    protein_g: float | None = Field(default=None, ge=0, le=1000)
    carbs_g: float | None = Field(default=None, ge=0, le=1000)
    fat_g: float | None = Field(default=None, ge=0, le=1000)


class FoodRead(BaseModel):
    id: int
    name: str
    serving_size: str
    calories_per_serving: float
    protein_g: float | None
    carbs_g: float | None
    fat_g: float | None
    created_at: datetime

    model_config = {"from_attributes": True}
