import logging
from typing import Dict, Any, List
from app.services.llm.router import route_agent_request
from app.prompts.refactor_prompt import REFACTOR_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

# Very basic prompt for inline PR review
PR_REVIEW_SYSTEM_PROMPT = """You are a Principal Engineer reviewing a Pull Request diff.
Analyze the diff and provide actionable, inline comments for critical issues only (bugs, security flaws, massive performance hits, or blatant anti-patterns).
Do not nitpick formatting.

Return your response in the following JSON format:
{
  "summary": "A brief 2-3 sentence summary of the PR and overall quality.",
  "status": "approve" | "request_changes" | "comment",
  "comments": [
    {
      "file": "path/to/file",
      "line": 42,
      "body": "The comment text",
      "severity": "high" | "medium" | "low"
    }
  ]
}
"""

async def generate_pr_review(diff: str) -> Dict[str, Any]:
    """
    Parses a diff and routes it to the AI for inline review comments.
    """
    try:
        # In a real system, you would chunk the diff if it exceeds context length
        # For this prototype, we send the raw diff
        user_content = f"Review the following PR diff:\n\n```diff\n{diff}\n```"
        
        result = await route_agent_request(
            agent_name="Refactoring", # Re-use the heavy model router mapping
            system_prompt=PR_REVIEW_SYSTEM_PROMPT,
            user_content=user_content
        )
        
        # Ensure fallback structure if LLM fails
        return {
            "summary": result.get("summary", "No summary provided."),
            "status": result.get("status", "comment"),
            "comments": result.get("comments", [])
        }
    except Exception as e:
        logger.error(f"Error generating PR review: {str(e)}")
        return {
            "summary": "Failed to analyze PR.",
            "status": "comment",
            "comments": []
        }
