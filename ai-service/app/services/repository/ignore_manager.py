import fnmatch
from typing import List

class IgnoreManager:
    """
    Handles filtering of files during repository ingestion to avoid analyzing
    dependencies, build artifacts, and non-source files.
    """
    DEFAULT_IGNORES = [
        # Directories
        "node_modules/*",
        ".git/*",
        "dist/*",
        "build/*",
        "coverage/*",
        "venv/*",
        ".venv/*",
        "__pycache__/*",
        ".next/*",
        "out/*",
        ".idea/*",
        ".vscode/*",
        
        # Files
        "*.min.js",
        "*.min.css",
        "package-lock.json",
        "yarn.lock",
        "pnpm-lock.yaml",
        "poetry.lock",
        "*.log",
        "*.png",
        "*.jpg",
        "*.jpeg",
        "*.gif",
        "*.ico",
        "*.svg",
        "*.ttf",
        "*.woff",
        "*.woff2",
        "*.pdf",
        "*.csv",
        "*.sqlite",
        "*.db",
        "DS_Store"
    ]

    def __init__(self, custom_ignores: List[str] = None):
        self.patterns = self.DEFAULT_IGNORES.copy()
        if custom_ignores:
            self.patterns.extend(custom_ignores)

    def should_ignore(self, file_path: str) -> bool:
        """
        Returns True if the file path matches any of the ignore patterns.
        """
        for pattern in self.patterns:
            # We use fnmatch to match wildcard patterns
            if fnmatch.fnmatch(file_path, pattern) or fnmatch.fnmatch(file_path, f"*/{pattern}"):
                return True
        return False
