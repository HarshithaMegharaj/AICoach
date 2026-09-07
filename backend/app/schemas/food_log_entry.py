from datetime import date, datetime

from pydantic import BaseModel, Field

from app.db.models import MealType
from app.schemas.food import FoodRead


class FoodLogEntryCreate(BaseModel):
    food_id: int
    logged_at: date
    meal_type: MealType
    quantity: float = Field(default=1.0, gt=0, le=100)


class FoodLogEntryUpdate(BaseModel):
    food_id: int | None = None
    logged_at: date | None = None
    meal_type: MealType | None = None
    quantity: float | None = Field(default=None, gt=0, le=100)


class FoodLogEntryRead(BaseModel):
    id: int
    food: FoodRead
    logged_at: date
    meal_type: MealType
    quantity: float
    calories: float
    protein_g: float | None
    carbs_g: float | None
    fat_g: float | None
    created_at: datetime

    model_config = {"from_attributes": True}
