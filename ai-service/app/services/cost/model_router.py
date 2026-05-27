import logging

logger = logging.getLogger(__name__)

class ModelRouter:
    """
    Intelligently routes requests to cheaper/faster LLM models based on the estimated payload size
    and the requested agent's complexity.
    """
    
    # Pricing tiers (abstract representation)
    MODELS = {
        "fast": "llama-3.1-8b-instant",         # Extremely fast, cheap, perfect for syntax/clean code
        "heavy": "llama-3.3-70b-versatile" # Slower, expensive, required for deep architecture/security
    }

    @staticmethod
    def select_model(agent_name: str, payload_text: str) -> str:
        """
        Calculates a rough token heuristic to dynamically select the correct model.
        """
        estimated_tokens = len(payload_text) // 4
        
        # 1. High-complexity agents ALWAYS require the heavy model regardless of size
        if agent_name in ["Architecture", "Security", "Refactoring"]:
            logger.info(f"[{agent_name}] Routing to HEAVY model (complexity requirement).")
            return ModelRouter.MODELS["heavy"]
            
        # 2. Low-complexity agents (Performance, Clean Code) can use the fast model IF the payload is small
        if estimated_tokens < 2000:
            logger.info(f"[{agent_name}] Routing to FAST model (payload: ~{estimated_tokens} tokens).")
            return ModelRouter.MODELS["fast"]
            
        # 3. If payload is massive, we must fall back to the heavy model to avoid context limits
        logger.info(f"[{agent_name}] Routing to HEAVY model (payload too large: ~{estimated_tokens} tokens).")
        return ModelRouter.MODELS["heavy"]
