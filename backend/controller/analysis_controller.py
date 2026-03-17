import logging
from fastapi import APIRouter, HTTPException
from schemas.analysis_schema import AnalyzeRequest
from services.analysis_service import perform_full_analysis
from google.genai.errors import ClientError

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
    
    except ClientError as e:
        logger.error("GenAI ClientError: %s", e)
        status_code = getattr(e, 'code', getattr(e, 'status_code', 500))
        if status_code == 429 or "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
            raise HTTPException(status_code=429, detail="AI service rate limit exceeded. Please try again later.")
        raise HTTPException(status_code=status_code if isinstance(status_code, int) else 500, detail="AI Assistant failed to generate the report.")
    except Exception as e:
        logger.exception("Analyze request failed")
        error_str = str(e)
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
            raise HTTPException(status_code=429, detail="AI service rate limit exceeded. Please try again later.")
        raise HTTPException(status_code=500, detail=error_str)
