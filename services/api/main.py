# services/api/main.py

from fastapi import FastAPI
from routes.alerts import router as alerts_router
from routes.health import router as health_router
from routes.incidents import router as incidents_router

app = FastAPI(title="DevOps Incident Center API")

# Include modular routers
app.include_router(alerts_router)
app.include_router(health_router)
app.include_router(incidents_router)

