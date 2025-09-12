# services/api/routes/incidents.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db.engine import SessionLocal
from db.models.incident import Incident

router = APIRouter(prefix="/incidents", tags=["Incidents"])

def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
async def get_incidents(db: Session = Depends(get_db)):
    """Get all incidents."""
    incidents = db.query(Incident).all()
    return incidents

@router.get("/{incident_id}")
async def get_incident(incident_id: str, db: Session = Depends(get_db)):
    """Get a specific incident by ID."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident
