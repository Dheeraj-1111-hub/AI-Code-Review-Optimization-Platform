import hashlib
import json
import logging
import redis

logger = logging.getLogger(__name__)

class ResponseCache:
    """
    Caches LLM responses based on a hash of the system prompt and user content.
    Prevents burning tokens on identical analyses (e.g., repeating a scan on the exact same file snapshot).
    """
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        try:
            self.redis = redis.Redis.from_url(redis_url, decode_responses=True)
            self.is_connected = True
        except Exception as e:
            logger.warning(f"Failed to connect to Redis cache: {str(e)}. Proceeding without cache.")
            self.is_connected = False

    def _generate_key(self, agent_name: str, system_prompt: str, user_content: str) -> str:
        """Generates a deterministic SHA-256 hash for the request."""
        content = f"{agent_name}:{system_prompt}:{user_content}"
        return hashlib.sha256(content.encode('utf-8')).hexdigest()

    async def get_cached_response(self, agent_name: str, system_prompt: str, user_content: str):
        if not self.is_connected:
            return None
            
        key = self._generate_key(agent_name, system_prompt, user_content)
        try:
            cached = self.redis.get(key)
            if cached:
                logger.info(f"Cache HIT for {agent_name} analysis.")
                return json.loads(cached)
            return None
        except Exception as e:
            logger.error(f"Redis get error: {str(e)}")
            return None

    async def set_cached_response(self, agent_name: str, system_prompt: str, user_content: str, response: dict, ttl_seconds: int = 86400):
        """Caches the response for 24 hours by default."""
        if not self.is_connected:
            return
            
        key = self._generate_key(agent_name, system_prompt, user_content)
        try:
            self.redis.setex(key, ttl_seconds, json.dumps(response))
        except Exception as e:
            logger.error(f"Redis set error: {str(e)}")
