# services/api/schemas/incident.py

from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class IncidentStatus(str, Enum):
    """Valid incident status values."""
    OPEN = "open"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"

class IncidentSeverity(str, Enum):
    """Valid incident severity values."""
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"
    LOW = "low"

class IncidentStatusUpdate(BaseModel):
    """Schema for updating incident status."""
    status: IncidentStatus = Field(..., description="New status for the incident")

    class Config:
        schema_extra = {
            "example": {
                "status": "acknowledged"
            }
        }

class IncidentResponse(BaseModel):
    """Schema for incident response."""
    id: str
    title: str
    service: str
    environment: str
    severity: str
    status: str
    assignee: Optional[str] = None
    source_alert: Optional[Dict[str, Any]] = None
    runbook_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "title": "High CPU usage on web server",
                "service": "web-api",
                "environment": "production",
                "severity": "critical",
                "status": "open",
                "assignee": "john.doe@company.com",
                "source_alert": {
                    "fingerprint": "abc123",
                    "labels": {"instance": "web-01"}
                },
                "runbook_url": "https://wiki.company.com/runbooks/high-cpu",
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:35:00Z"
            }
        }
