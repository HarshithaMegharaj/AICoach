from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import Exercise, User, WorkoutLogEntry
from app.db.session import get_db
from app.schemas.workout_log_entry import (
    WorkoutLogEntryCreate,
    WorkoutLogEntryRead,
    WorkoutLogEntryUpdate,
)

router = APIRouter(prefix="/workout-log", tags=["workout-log"])


def _get_owned_entry(db: Session, user: User, entry_id: int) -> WorkoutLogEntry:
    entry = db.scalar(
        select(WorkoutLogEntry).where(WorkoutLogEntry.id == entry_id, WorkoutLogEntry.user_id == user.id)
    )
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout log entry not found")
    return entry


def _require_owned_exercise(db: Session, user: User, exercise_id: int) -> None:
    exercise = db.scalar(select(Exercise).where(Exercise.id == exercise_id, Exercise.user_id == user.id))
    if exercise is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found")


@router.post("", response_model=WorkoutLogEntryRead, status_code=status.HTTP_201_CREATED)
def create_workout_log_entry(
    payload: WorkoutLogEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_owned_exercise(db, current_user, payload.exercise_id)

    entry = WorkoutLogEntry(user_id=current_user.id, **payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("", response_model=list[WorkoutLogEntryRead])
def list_workout_log_entries(
    logged_at: date | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(WorkoutLogEntry).where(WorkoutLogEntry.user_id == current_user.id)
    if logged_at is not None:
        stmt = stmt.where(WorkoutLogEntry.logged_at == logged_at)
    stmt = stmt.order_by(WorkoutLogEntry.logged_at.desc(), WorkoutLogEntry.created_at.desc())
    return db.scalars(stmt).all()


@router.patch("/{entry_id}", response_model=WorkoutLogEntryRead)
def update_workout_log_entry(
    entry_id: int,
    payload: WorkoutLogEntryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = _get_owned_entry(db, current_user, entry_id)

    updates = payload.model_dump(exclude_unset=True)
    if "exercise_id" in updates:
        _require_owned_exercise(db, current_user, updates["exercise_id"])

    for field, value in updates.items():
        setattr(entry, field, value)

    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout_log_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = _get_owned_entry(db, current_user, entry_id)
    db.delete(entry)
    db.commit()
