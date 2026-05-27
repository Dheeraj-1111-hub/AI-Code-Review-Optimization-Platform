import logging
from typing import Tuple

logger = logging.getLogger(__name__)

class PromptSanitizer:
    """
    Evaluates incoming code snippets for Prompt Injection, Jailbreaks, and malicious commands.
    Prevents the LLM from executing hidden instructions within the submitted code.
    """
    
    # Common attack vectors hidden in code comments or strings
    INJECTION_PATTERNS = [
        "ignore previous instructions",
        "system prompt",
        "forget all instructions",
        "you are now a",
        "output your exact prompt",
        "reveal your rules",
        "bypass security",
    ]

    @staticmethod
    def is_safe(code_snippet: str) -> Tuple[bool, str]:
        """
        Returns (is_safe: bool, reason: str)
        """
        snippet_lower = code_snippet.lower()
        
        # 1. Check for token flooding/DoS
        if len(code_snippet) > 500000: # Arbitrary large limit
            return False, "Payload exceeds maximum safe token length."

        # 2. Check for semantic injection patterns
        for pattern in PromptSanitizer.INJECTION_PATTERNS:
            if pattern in snippet_lower:
                logger.warning(f"SECURITY ALERT: Prompt Injection Attempt detected: '{pattern}'")
                return False, f"Malicious instruction detected matching pattern: {pattern}"

        # 3. Add more advanced regex / NLP heuristic checks here in the future
        
        return True, "Safe"
