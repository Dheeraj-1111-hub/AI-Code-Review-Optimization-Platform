from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import logging
from app.services.pr.inline_comment_generator import generate_pr_review
from app.agents.pr.orchestrator import orchestrate_pr_simulation
import httpx

logger = logging.getLogger(__name__)

router = APIRouter()

class PRAnalysisRequest(BaseModel):
    diff: str
    owner: str
    repo: str
    pullNumber: int

@router.post("/pr")
async def analyze_pr(request: PRAnalysisRequest):
    """
    Analyzes a Pull Request diff and generates inline comments and a summary verdict.
    """
    logger.info(f"Received PR analysis request for {request.owner}/{request.repo}#{request.pullNumber}")
    try:
        review_result = await generate_pr_review(request.diff)
        return review_result
    except Exception as e:
        logger.error(f"Error in PR analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

class PRSimulateRequest(BaseModel):
    prId: str
    files: List[Dict[str, Any]]
    aiConfig: Dict[str, Any] = {}

@router.post("/pr/simulate")
async def simulate_pr_review(request: PRSimulateRequest):
    logger.info(f"Starting Multi-Agent PR Simulation for PR {request.prId}")
    try:
        # Run the multi-agent simulation
        agent_reviews = await orchestrate_pr_simulation(request.files, request.aiConfig)
        
        # In a real distributed system, we could emit socket events via redis pub/sub,
        # but since we have a direct Express backend, we can just POST the results back
        # to a webhook endpoint or let the caller handle it.
        # However, the Express backend is waiting for a webhook, OR we can just return it
        # and the Express backend handles it. Wait, our Express backend started it async!
        # Let's send the results back via webhook to Node.js!
        
        webhook_url = "http://localhost:5000/api/v1/pr/webhook"
        async with httpx.AsyncClient() as client:
            await client.post(webhook_url, json={
                "prId": request.prId,
                "agent_reviews": agent_reviews
            })
            
        return {"success": True, "message": "Simulation started and results will be webhooked"}
    except Exception as e:
        logger.error(f"Error in PR simulation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
