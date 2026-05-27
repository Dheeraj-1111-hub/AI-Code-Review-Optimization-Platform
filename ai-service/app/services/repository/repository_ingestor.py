import os
import shutil
import tempfile
import subprocess
import logging
from typing import Dict, Any
from .file_tree_builder import build_file_tree
from .ignore_manager import IgnoreManager

logger = logging.getLogger(__name__)

class RepositoryIngestor:
    """
    Handles cloning repositories securely and building the initial file structure
    for the AI to analyze.
    """
    def __init__(self, storage_dir: str = None):
        # By default, use the system temp directory if no specific storage is provided
        self.storage_dir = storage_dir or tempfile.gettempdir()
        self.ignore_manager = IgnoreManager()

    def _get_clone_url(self, repo_url: str, token: str = None) -> str:
        """
        Injects the OAuth/PAT token into the clone URL for private repo access.
        """
        if not token:
            return repo_url
            
        # Basic injection for standard https github urls
        if repo_url.startswith("https://github.com/"):
            return repo_url.replace("https://github.com/", f"https://x-access-token:{token}@github.com/")
            
        return repo_url

    async def ingest_repository(self, repo_url: str, branch: str = "main", token: str = None) -> Dict[str, Any]:
        """
        Clones a repository, builds the file tree, and prepares it for analysis.
        Returns a dict containing the local path and the generated file tree.
        """
        repo_name = repo_url.split("/")[-1].replace(".git", "")
        # Create a unique directory for this ingestion
        target_dir = os.path.join(self.storage_dir, f"devlens_{repo_name}_{os.urandom(4).hex()}")
        
        clone_url = self._get_clone_url(repo_url, token)
        
        try:
            logger.info(f"Cloning repository {repo_name} (branch: {branch}) into {target_dir}")
            
            # Shallow clone for speed and space efficiency
            subprocess.run(
                ["git", "clone", "--depth", "1", "-b", branch, clone_url, target_dir],
                check=True,
                capture_output=True,
                text=True
            )
            
            logger.info(f"Successfully cloned {repo_name}. Building file tree...")
            
            # Build the File Tree
            file_tree = build_file_tree(target_dir, self.ignore_manager)
            
            return {
                "success": True,
                "local_path": target_dir,
                "file_tree": file_tree,
                "repo_name": repo_name,
                "branch": branch
            }
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Git clone failed: {e.stderr}")
            if os.path.exists(target_dir):
                shutil.rmtree(target_dir, ignore_errors=True)
            return {
                "success": False,
                "error": "Failed to clone repository. Check URL, branch, and permissions."
            }
        except Exception as e:
            logger.error(f"Ingestion failed: {str(e)}")
            if os.path.exists(target_dir):
                shutil.rmtree(target_dir, ignore_errors=True)
            return {
                "success": False,
                "error": str(e)
            }

    def cleanup(self, local_path: str):
        """
        Removes the ingested repository from disk after analysis is complete.
        """
        if os.path.exists(local_path) and "devlens_" in local_path:
            try:
                shutil.rmtree(local_path, ignore_errors=True)
                logger.info(f"Cleaned up repository at {local_path}")
            except Exception as e:
                logger.error(f"Failed to clean up {local_path}: {str(e)}")
