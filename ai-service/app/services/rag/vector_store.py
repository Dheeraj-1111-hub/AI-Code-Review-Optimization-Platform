import chromadb
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class VectorStore:
    """
    Manages the ChromaDB instance for storing and retrieving RAG memory (Engineering DNA, Architecture Rules).
    """
    def __init__(self, persist_directory: str = "./chroma_db"):
        self.client = chromadb.PersistentClient(path=persist_directory)
        
        # Collection for storing general AI memory (coding conventions, anti-patterns)
        self.memory_collection = self.client.get_or_create_collection(
            name="workspace_memory",
            metadata={"hnsw:space": "cosine"}
        )

    def store_memory(self, workspace_id: str, document: str, metadata: Dict[str, Any], memory_id: str):
        """
        Embeds and stores a new piece of memory for a workspace.
        """
        try:
            # Metadata must contain workspace_id for RBAC tenant isolation
            enriched_metadata = {**metadata, "workspace_id": workspace_id}
            
            self.memory_collection.add(
                documents=[document],
                metadatas=[enriched_metadata],
                ids=[memory_id]
            )
            logger.info(f"Successfully stored memory {memory_id} for workspace {workspace_id}")
        except Exception as e:
            logger.error(f"Failed to store memory in Vector DB: {str(e)}")

    def retrieve_context(self, workspace_id: str, query: str, limit: int = 3) -> List[str]:
        """
        Retrieves the most semantically relevant memories for a given PR / Review query.
        """
        try:
            results = self.memory_collection.query(
                query_texts=[query],
                n_results=limit,
                # Crucial: Only return memories belonging to THIS workspace
                where={"workspace_id": workspace_id}
            )
            
            if results and results["documents"]:
                # results["documents"] is a list of lists, take the first query's results
                return results["documents"][0]
            return []
        except Exception as e:
            logger.error(f"Failed to retrieve context from Vector DB: {str(e)}")
            return []
