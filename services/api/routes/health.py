# services/api/routes/health.py

from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {"status": "ok"}

@router.get("/ready")
def readiness_check():
    return {"status": "ready"}
