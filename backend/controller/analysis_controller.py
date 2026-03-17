import logging
from fastapi import APIRouter, HTTPException
from schemas.analysis_schema import AnalyzeRequest
from services.analysis_service import perform_full_analysis

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/")
def read_root():
    return {"Hello": "World"}

@router.post("/analyze")
async def analyze_url(payload: AnalyzeRequest):
    url = payload.url

    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
    
    try:
        logger.info("Analyze request received for URL: %s", url)

        result = await perform_full_analysis(url)

        logger.info("Analyze request completed for URL: %s", url)

        return result
    
    except Exception as e:
        logger.exception("Analyze request failed")
        raise HTTPException(status_code=500, detail=str(e))
