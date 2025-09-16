# services/api/routes/incidents.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List
from db.engine import SessionLocal
from db.models.incident import Incident
from schemas.incident import IncidentStatusUpdate, IncidentResponse

router = APIRouter(prefix="/incidents", tags=["Incidents"])

def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[IncidentResponse])
async def get_incidents(db: Session = Depends(get_db)):
    """Get all incidents."""
    incidents = db.query(Incident).all()
    return incidents

@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(incident_id: str, db: Session = Depends(get_db)):
    """Get a specific incident by ID."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.patch("/{incident_id}", response_model=IncidentResponse)
async def update_incident_status(
    incident_id: str, 
    status_update: IncidentStatusUpdate, 
    db: Session = Depends(get_db)
):
    """Update the status of an incident."""
    # Find the incident
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Update the status and updated_at timestamp
    incident.status = status_update.status.value
    incident.updated_at = func.now()
    
    # Commit the changes
    try:
        db.commit()
        db.refresh(incident)
        return incident
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update incident: {str(e)}")
