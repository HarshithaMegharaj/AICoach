from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import Food, User
from app.db.session import get_db
from app.schemas.food import FoodCreate, FoodRead, FoodUpdate

router = APIRouter(prefix="/foods", tags=["foods"])


def _get_owned_food(db: Session, user: User, food_id: int) -> Food:
    food = db.scalar(select(Food).where(Food.id == food_id, Food.user_id == user.id))
    if food is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food not found")
    return food


@router.post("", response_model=FoodRead, status_code=status.HTTP_201_CREATED)
def create_food(
    payload: FoodCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    food = Food(user_id=current_user.id, **payload.model_dump())
    db.add(food)
    db.commit()
    db.refresh(food)
    return food


@router.get("", response_model=list[FoodRead])
def list_foods(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(Food).where(Food.user_id == current_user.id).order_by(Food.name)
    return db.scalars(stmt).all()


@router.patch("/{food_id}", response_model=FoodRead)
def update_food(
    food_id: int,
    payload: FoodUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    food = _get_owned_food(db, current_user, food_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(food, field, value)
    db.commit()
    db.refresh(food)
    return food


@router.delete("/{food_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_food(
    food_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    food = _get_owned_food(db, current_user, food_id)
    db.delete(food)
    db.commit()
