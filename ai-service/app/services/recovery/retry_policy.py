import asyncio
import logging
from typing import Callable, Any

logger = logging.getLogger(__name__)

class RetryPolicy:
    """
    Wraps critical AI and network calls in an exponential backoff loop
    to survive rate limits (429) or transient timeouts (504).
    """
    
    @staticmethod
    async def execute_with_retry(
        func: Callable, 
        *args, 
        max_retries: int = 3, 
        base_delay_ms: int = 1000, 
        **kwargs
    ) -> Any:
        
        attempt = 0
        while attempt <= max_retries:
            try:
                # Await the target function
                return await func(*args, **kwargs)
                
            except Exception as e:
                attempt += 1
                error_str = str(e).lower()
                
                # If it's a hard error (e.g., Auth failure), don't retry
                if "authentication" in error_str or "401" in error_str:
                    logger.error("Authentication failed. Aborting retry.")
                    raise e
                    
                if attempt > max_retries:
                    logger.error(f"Max retries ({max_retries}) exceeded. Failing.")
                    raise e
                    
                # Calculate exponential backoff (1s, 2s, 4s...)
                delay = (base_delay_ms * (2 ** (attempt - 1))) / 1000.0
                logger.warning(f"Execution failed: {str(e)}. Retrying in {delay}s (Attempt {attempt}/{max_retries})...")
                
                await asyncio.sleep(delay)
