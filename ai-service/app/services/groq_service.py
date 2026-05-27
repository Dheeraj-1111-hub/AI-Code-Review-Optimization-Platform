from groq import Groq
import json
import asyncio
import re
from app.config.settings import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Groq client
# We use the sync client for simple API calls, but typically we want async.
# Groq has an AsyncGroq client.
from groq import AsyncGroq
client = AsyncGroq(api_key=settings.GROQ_API_KEY)

async def generate_structured_response(system_prompt: str, user_content: str, model: str = "llama-3.1-8b-instant") -> dict:
    """
    Calls Groq to generate a JSON structured response.
    We append a directive to ensure JSON output.
    """
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = await client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt + "\n\nYou MUST respond with valid JSON only. Do not include markdown formatting like ```json."
                    },
                    {
                        "role": "user",
                        "content": user_content
                    }
                ],
                model=model,
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            if not content:
                return {}
                
            return json.loads(content)
            
        except Exception as e:
            error_msg = str(e)
            if "Rate limit reached" in error_msg and attempt < max_retries - 1:
                # Try to extract the wait time from "Please try again in 5.55s."
                wait_time = 6.0 # Default fallback
                match = re.search(r"try again in ([\d\.]+)s", error_msg)
                if match:
                    wait_time = float(match.group(1)) + 1.0 # Add 1s buffer
                
                logger.warning(f"Groq Rate limit hit. Retrying in {wait_time}s... (Attempt {attempt+1}/{max_retries})")
                await asyncio.sleep(wait_time)
                continue
                
            logger.error(f"Groq API error: {error_msg}")
            # Return a fallback structured error
            return {
                "score": 0,
                "issues": [{
                    "severity": "high",
                    "message": f"AI Engine Error: {error_msg}",
                    "suggestion": "Check AI service configuration."
                }],
                "summary": "Failed to analyze code due to an internal AI service error."
            }


async def generate_text_response(system_prompt: str, user_content: str, model: str = "llama-3.1-8b-instant") -> str:
    """
    Calls Groq to generate a plain text response.
    """
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = await client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": user_content
                    }
                ],
                model=model,
                temperature=0.2
            )
            
            content = response.choices[0].message.content
            return content or "Analysis complete."
            
        except Exception as e:
            error_msg = str(e)
            if "Rate limit reached" in error_msg and attempt < max_retries - 1:
                wait_time = 6.0
                match = re.search(r"try again in ([\d\.]+)s", error_msg)
                if match:
                    wait_time = float(match.group(1)) + 1.0
                
                logger.warning(f"Groq Rate limit hit for text. Retrying in {wait_time}s... (Attempt {attempt+1}/{max_retries})")
                await asyncio.sleep(wait_time)
                continue
                
            logger.error(f"Groq API error in text generation: {error_msg}")
            return "Analysis complete. Review individual agent findings for details."
