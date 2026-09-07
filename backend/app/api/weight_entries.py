from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import User, WeightEntry
from app.db.session import get_db
from app.schemas.weight_entry import WeightEntryCreate, WeightEntryRead, WeightEntryUpdate

router = APIRouter(prefix="/weight-entries", tags=["weight-entries"])


def _get_owned_entry(db: Session, user: User, entry_id: int) -> WeightEntry:
    entry = db.scalar(
        select(WeightEntry).where(WeightEntry.id == entry_id, WeightEntry.user_id == user.id)
    )
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Weight entry not found")
    return entry


def _existing_entry_for_date(db: Session, user: User, recorded_at, exclude_id: int | None = None):
    stmt = select(WeightEntry).where(
        WeightEntry.user_id == user.id, WeightEntry.recorded_at == recorded_at
    )
    if exclude_id is not None:
        stmt = stmt.where(WeightEntry.id != exclude_id)
    return db.scalar(stmt)


@router.post("", response_model=WeightEntryRead, status_code=status.HTTP_201_CREATED)
def create_weight_entry(
    payload: WeightEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if _existing_entry_for_date(db, current_user, payload.recorded_at) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A weight entry already exists for that date",
        )

    entry = WeightEntry(
        user_id=current_user.id,
        recorded_at=payload.recorded_at,
        weight_kg=payload.weight_kg,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("", response_model=list[WeightEntryRead])
def list_weight_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = (
        select(WeightEntry)
        .where(WeightEntry.user_id == current_user.id)
        .order_by(WeightEntry.recorded_at.desc())
    )
    return db.scalars(stmt).all()


@router.patch("/{entry_id}", response_model=WeightEntryRead)
def update_weight_entry(
    entry_id: int,
    payload: WeightEntryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = _get_owned_entry(db, current_user, entry_id)

    updates = payload.model_dump(exclude_unset=True)
    new_date = updates.get("recorded_at", entry.recorded_at)
    if _existing_entry_for_date(db, current_user, new_date, exclude_id=entry.id) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A weight entry already exists for that date",
        )

    for field, value in updates.items():
        setattr(entry, field, value)

    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_weight_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = _get_owned_entry(db, current_user, entry_id)
    db.delete(entry)
    db.commit()
