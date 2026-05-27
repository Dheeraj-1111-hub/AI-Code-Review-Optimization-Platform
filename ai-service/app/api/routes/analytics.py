from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.groq_service import generate_text_response
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class RecurringMistake(BaseModel):
    issueType: str
    count: int

class AnalyticsPayload(BaseModel):
    qualityScore: float
    vulnerabilities: Dict[str, int]
    complexity: float
    recurringMistakes: List[RecurringMistake]
    avgSecurity: float
    avgArchitecture: float
    reviewCount: int

@router.post("/analytics/generate-summary")
async def generate_summary(payload: AnalyticsPayload):
    try:
        system_prompt = """
        You are an elite Staff Engineer analyzing organizational repository health metrics.
        The user will provide you with aggregated analytics covering recent code reviews.
        Your job is to generate a concise, highly insightful executive summary of these metrics.
        
        Guidelines:
        1. Keep it to 3-4 bullet points.
        2. Highlight the most critical trends (e.g. high complexity, recurring mistakes).
        3. Do not sound like a bot. Sound like an experienced engineering manager.
        4. Do not include markdown headers. Just output the text or bullet points directly.
        """
        
        user_content = f"""
        Aggregated Metrics over the last {payload.reviewCount} reviews:
        - Overall Quality Score: {payload.qualityScore:.2f}/100
        - System Complexity Index: {payload.complexity:.2f}/100
        - Security Vulnerabilities found: {payload.vulnerabilities.get('critical', 0)} Critical, {payload.vulnerabilities.get('high', 0)} High.
        - Recurring Mistakes: {', '.join([f"{m.issueType} (x{m.count})" for m in payload.recurringMistakes])}
        - Avg Architecture Score: {payload.avgArchitecture:.2f}/100
        
        Analyze this and give me the executive summary.
        """
        
        summary = await generate_text_response(system_prompt, user_content, model="llama-3.3-70b-versatile")
        
        return {"summary": summary}
        
    except Exception as e:
        logger.error(f"Failed to generate analytics summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate analytics summary")
