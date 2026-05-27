import logging
import re

logger = logging.getLogger(__name__)

def parse_code(code: str, language: str):
    """
    Fallback parser when tree-sitter is not available.
    Returns the raw code string, which is then processed by extract_functions.
    """
    return code
def extract_functions(code_str: str, source_code: bytes, lang: str):
    """
    Extracts functions using regex heuristics since tree-sitter is unsupported on this Python version.
    """
    functions = []
    
    # Simple regex for python defs
    if lang in ['python', 'py']:
        pattern = re.compile(r'^\s*def\s+[a-zA-Z0-9_]+\s*\(.*?\):', re.MULTILINE | re.DOTALL)
    # Simple regex for JS/TS
    elif lang in ['javascript', 'js', 'typescript', 'ts', 'tsx', 'jsx']:
        pattern = re.compile(r'(?:function\s+[a-zA-Z0-9_]+|const\s+[a-zA-Z0-9_]+\s*=\s*\(.*?\)\s*=>|class\s+[a-zA-Z0-9_]+)', re.MULTILINE)
    else:
        return []

    try:
        lines = code_str.split('\n')
        matches = pattern.finditer(code_str)
        
        for match in matches:
            # Calculate rough start line
            start_idx = match.start()
            start_line = code_str.count('\n', 0, start_idx) + 1
            
            # Since regex can't easily parse balanced brackets, we just capture a semantic chunk around it
            end_line = min(start_line + 50, len(lines)) 
            
            chunk_code = "\n".join(lines[start_line-1:end_line])
            
            functions.append({
                "start_line": start_line,
                "end_line": end_line,
                "code": chunk_code
            })
    except Exception as e:
        logger.debug(f"Regex extraction failed: {str(e)}")
        
    return functions
