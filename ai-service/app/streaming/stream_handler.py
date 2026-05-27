import asyncio
import json
from typing import AsyncGenerator
from app.pipelines.review_pipeline import run_full_review
import logging

logger = logging.getLogger(__name__)

async def review_stream_generator(code: str, language: str) -> AsyncGenerator[str, None]:
    """
    Yields SSE formatted strings to the client.
    Because we run agents concurrently, we will yield status updates,
    and then yield the final aggregated review.
    """
    try:
        # 1. Initial Status
        yield f"data: {json.dumps({'type': 'status', 'message': 'Initializing AI Engineering System...'})}\n\n"
        await asyncio.sleep(0.5)
        
        yield f"data: {json.dumps({'type': 'status', 'message': 'Running static analysis (Radon, Bandit)...'})}\n\n"
        
        # We run the full review pipeline. In a more advanced implementation, 
        # we could yield from inside the pipeline as each agent finishes.
        # For now, we simulate the progressive feeling.
        yield f"data: {json.dumps({'type': 'status', 'message': 'Executing Multi-Agent Pipeline...'})}\n\n"
        
        # Await the actual heavy lifting
        final_result = await run_full_review(code, language)
        
        yield f"data: {json.dumps({'type': 'status', 'message': 'Aggregating agent results...'})}\n\n"
        await asyncio.sleep(0.5)
        
        # Yield the final complete result
        yield f"data: {json.dumps({'type': 'complete', 'result': final_result})}\n\n"

    except Exception as e:
        logger.error(f"Stream error: {str(e)}")
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
