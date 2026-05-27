def detect_language(code: str, filename: str = None) -> str:
    """
    Detects the programming language of the given code.
    If filename is provided, uses extension.
    Otherwise uses basic heuristics.
    """
    if filename:
        ext = filename.split('.')[-1].lower()
        ext_map = {
            'py': 'python',
            'js': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'jsx': 'javascript',
            'go': 'go',
            'java': 'java',
            'rs': 'rust',
            'cpp': 'cpp',
            'c': 'c',
            'rb': 'ruby',
            'php': 'php'
        }
        if ext in ext_map:
            return ext_map[ext]
            
    # Basic heuristics
    if "def " in code and "import " in code and ":" in code:
        return "python"
    if "function" in code or "const " in code or "let " in code:
        if "interface " in code or "type " in code or ": " in code:
            return "typescript"
        return "javascript"
    if "package " in code and "func " in code:
        return "go"
    if "public class" in code:
        return "java"
        
    # Default fallback
    return "javascript"
