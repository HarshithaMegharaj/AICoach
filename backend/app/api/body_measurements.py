from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import BodyMeasurement, User
from app.db.session import get_db
from app.schemas.body_measurement import (
    BodyMeasurementCreate,
    BodyMeasurementRead,
    BodyMeasurementUpdate,
)

router = APIRouter(prefix="/body-measurements", tags=["body-measurements"])


def _get_owned_entry(db: Session, user: User, entry_id: int) -> BodyMeasurement:
    entry = db.scalar(
        select(BodyMeasurement).where(
            BodyMeasurement.id == entry_id, BodyMeasurement.user_id == user.id
        )
    )
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Measurement entry not found")
    return entry


def _existing_entry_for_date(db: Session, user: User, recorded_at, exclude_id: int | None = None):
    stmt = select(BodyMeasurement).where(
        BodyMeasurement.user_id == user.id, BodyMeasurement.recorded_at == recorded_at
    )
    if exclude_id is not None:
        stmt = stmt.where(BodyMeasurement.id != exclude_id)
    return db.scalar(stmt)


@router.post("", response_model=BodyMeasurementRead, status_code=status.HTTP_201_CREATED)
def create_body_measurement(
    payload: BodyMeasurementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if _existing_entry_for_date(db, current_user, payload.recorded_at) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A measurement entry already exists for that date",
        )

    entry = BodyMeasurement(user_id=current_user.id, **payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("", response_model=list[BodyMeasurementRead])
def list_body_measurements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = (
        select(BodyMeasurement)
        .where(BodyMeasurement.user_id == current_user.id)
        .order_by(BodyMeasurement.recorded_at.desc())
    )
    return db.scalars(stmt).all()


@router.patch("/{entry_id}", response_model=BodyMeasurementRead)
def update_body_measurement(
    entry_id: int,
    payload: BodyMeasurementUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = _get_owned_entry(db, current_user, entry_id)

    updates = payload.model_dump(exclude_unset=True)
    new_date = updates.get("recorded_at", entry.recorded_at)
    if _existing_entry_for_date(db, current_user, new_date, exclude_id=entry.id) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A measurement entry already exists for that date",
        )

    for field, value in updates.items():
        setattr(entry, field, value)

    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_body_measurement(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = _get_owned_entry(db, current_user, entry_id)
    db.delete(entry)
    db.commit()
