# services/api/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.alerts import router as alerts_router
from routes.health import router as health_router
from routes.incidents import router as incidents_router

app = FastAPI(title="DevOps Incident Center API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root route
@app.get("/")
async def root():
    return {"message": "DevOps Incident Center API", "status": "running"}

# Include modular routers
app.include_router(alerts_router)
app.include_router(health_router)
app.include_router(incidents_router)
