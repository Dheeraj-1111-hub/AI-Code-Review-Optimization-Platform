from app.services.rag.vector_store import VectorStore
import logging

logger = logging.getLogger(__name__)

# Initialize a global singleton of VectorStore to avoid reconnecting DB
vector_store = VectorStore()

class MemoryRetriever:
    """
    Acts as the middleware between the LLM Prompt Generator and the Vector Database.
    Fetches the team's engineering DNA before running a review.
    """
    @staticmethod
    def get_workspace_context(workspace_id: str, code_snippet: str) -> str:
        """
        Uses the provided code snippet to search the Vector DB for similar past issues,
        established rules, or team preferences.
        """
        if not workspace_id:
            return ""

        logger.info(f"Retrieving RAG memory context for workspace {workspace_id}")
        
        # We query the DB using the code snippet to find semantically related architectural rules
        memories = vector_store.retrieve_context(workspace_id, query=code_snippet, limit=3)
        
        if not memories:
            return ""
            
        context_string = "\nTEAM CONVENTIONS & MEMORY (Strictly Adhere to These):\n"
        for idx, memory in enumerate(memories):
            context_string += f"{idx + 1}. {memory}\n"
            
        return context_string
