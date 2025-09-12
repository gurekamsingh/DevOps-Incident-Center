# services/api/routes/alerts.py

from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
import json
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.post("/")
async def receive_alert(request: Request):
    """Receive alerts from Prometheus Alertmanager."""
    try:
        body = await request.json()
        
        # Log the received alert for debugging
        logger.info("Received alert from Alertmanager:")
        logger.info(json.dumps(body, indent=2))
        
        # Print to console for easy viewing
        print("🚨 ALERT RECEIVED:")
        print(json.dumps(body, indent=2))
        
        # TODO: Process alert and create incident
        # This will be implemented in future iterations
        
        return JSONResponse(
            content={"message": "Alert received successfully", "status": "processed"},
            status_code=status.HTTP_200_OK
        )
        
    except Exception as e:
        logger.error(f"Error processing alert: {str(e)}")
        return JSONResponse(
            content={"error": "Failed to process alert", "details": str(e)},
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
