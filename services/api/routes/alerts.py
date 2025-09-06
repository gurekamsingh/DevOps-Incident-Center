# services/api/routes/alerts.py

from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.post("/")
async def receive_alert(request: Request):
    body = await request.json()
    # For now, just print and return dummy response
    print("Received alert:", body)
    return JSONResponse(content={"message": "Alert received"}, status_code=status.HTTP_200_OK)
