from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.schemas.review_schema import CodeInput
from app.streaming.stream_handler import review_stream_generator

router = APIRouter()

@router.post("/analyze/stream")
async def analyze_code_stream(input_data: CodeInput):
    """
    Starts the multi-agent analysis pipeline and streams the results back
    using Server-Sent Events (SSE).
    """
    if not input_data.code or len(input_data.code.strip()) == 0:
        raise HTTPException(status_code=400, detail="Code cannot be empty.")
        
    return StreamingResponse(
        review_stream_generator(input_data.code, input_data.language),
        media_type="text/event-stream"
    )
