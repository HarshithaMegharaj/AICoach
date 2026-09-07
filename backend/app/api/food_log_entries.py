from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import Food, FoodLogEntry, User
from app.db.session import get_db
from app.schemas.food_log_entry import FoodLogEntryCreate, FoodLogEntryRead, FoodLogEntryUpdate

router = APIRouter(prefix="/food-log", tags=["food-log"])


def _get_owned_entry(db: Session, user: User, entry_id: int) -> FoodLogEntry:
    entry = db.scalar(
        select(FoodLogEntry).where(FoodLogEntry.id == entry_id, FoodLogEntry.user_id == user.id)
    )
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food log entry not found")
    return entry


def _require_owned_food(db: Session, user: User, food_id: int) -> None:
    food = db.scalar(select(Food).where(Food.id == food_id, Food.user_id == user.id))
    if food is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food not found")


@router.post("", response_model=FoodLogEntryRead, status_code=status.HTTP_201_CREATED)
def create_food_log_entry(
    payload: FoodLogEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_owned_food(db, current_user, payload.food_id)

    entry = FoodLogEntry(user_id=current_user.id, **payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("", response_model=list[FoodLogEntryRead])
def list_food_log_entries(
    logged_at: date | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(FoodLogEntry).where(FoodLogEntry.user_id == current_user.id)
    if logged_at is not None:
        stmt = stmt.where(FoodLogEntry.logged_at == logged_at)
    stmt = stmt.order_by(FoodLogEntry.logged_at.desc(), FoodLogEntry.created_at.desc())
    return db.scalars(stmt).all()


@router.patch("/{entry_id}", response_model=FoodLogEntryRead)
def update_food_log_entry(
    entry_id: int,
    payload: FoodLogEntryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = _get_owned_entry(db, current_user, entry_id)

    updates = payload.model_dump(exclude_unset=True)
    if "food_id" in updates:
        _require_owned_food(db, current_user, updates["food_id"])

    for field, value in updates.items():
        setattr(entry, field, value)

    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_food_log_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = _get_owned_entry(db, current_user, entry_id)
    db.delete(entry)
    db.commit()
