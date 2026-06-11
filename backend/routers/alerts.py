from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud
import models
import schemas
from database import get_db


router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/", response_model=List[schemas.Alert])
def read_alerts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_alerts(db, skip=skip, limit=limit)


@router.put("/{alert_id}/status", response_model=schemas.Alert)
def update_alert_status(
    alert_id: int,
    payload: schemas.AlertStatusUpdate,
    db: Session = Depends(get_db),
):
    db_alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    if payload.status not in ["New", "Reviewing", "Resolved"]:
        raise HTTPException(status_code=400, detail="Invalid status value")

    db_alert.status = payload.status
    db.commit()
    db.refresh(db_alert)
    return db_alert
