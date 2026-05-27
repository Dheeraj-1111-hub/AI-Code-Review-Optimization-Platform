import os
from typing import Dict, Any, List
from .ignore_manager import IgnoreManager

def build_file_tree(repo_path: str, ignore_manager: IgnoreManager = None) -> Dict[str, Any]:
    """
    Scans a local repository directory and returns a structured file tree,
    skipping ignored files.
    """
    if not ignore_manager:
        ignore_manager = IgnoreManager()

    def _build_tree(current_path: str, root_dir: str) -> List[Dict[str, Any]]:
        tree = []
        try:
            for item in os.listdir(current_path):
                full_path = os.path.join(current_path, item)
                rel_path = os.path.relpath(full_path, root_dir)

                # Use forward slashes for cross-platform consistency
                rel_path = rel_path.replace("\\", "/")

                if ignore_manager.should_ignore(rel_path):
                    continue

                if os.path.isdir(full_path):
                    children = _build_tree(full_path, root_dir)
                    if children: # Only add directories if they have un-ignored children
                        tree.append({
                            "name": item,
                            "type": "directory",
                            "path": rel_path,
                            "children": children
                        })
                else:
                    tree.append({
                        "name": item,
                        "type": "file",
                        "path": rel_path
                    })
        except PermissionError:
            pass
            
        # Sort so directories come first, then files, both alphabetically
        tree.sort(key=lambda x: (0 if x["type"] == "directory" else 1, x["name"].lower()))
        return tree

    return {
        "name": os.path.basename(repo_path),
        "type": "directory",
        "path": "",
        "children": _build_tree(repo_path, repo_path)
    }
