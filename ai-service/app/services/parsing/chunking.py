import logging
from typing import List, Dict, Any
from app.services.parsing.ast_parser import parse_code, extract_functions

logger = logging.getLogger(__name__)

def semantic_chunk_code(code: str, language: str, max_chunk_size: int = 4000) -> List[Dict[str, Any]]:
    """
    Chunks code semantically using AST if possible.
    Falls back to line-based chunking if AST parsing fails or language is unsupported.
    """
    chunks = []
    
    # Try AST-based extraction first
    try:
        root_node = parse_code(code, language)
        if root_node:
            functions = extract_functions(root_node, code.encode("utf8"), language)
            if functions:
                # Add functions as distinct semantic chunks
                for func in functions:
                    chunks.append({
                        "type": "function",
                        "start_line": func["start_line"],
                        "end_line": func["end_line"],
                        "code": func["code"]
                    })
                
                # In a complete implementation, we'd also chunk the non-function parts (imports, classes, etc.)
                # For now, if we found functions, we return them alongside the full code as a fallback chunk
                chunks.append({
                    "type": "full_context",
                    "start_line": 0,
                    "end_line": len(code.split('\n')),
                    "code": code[:max_chunk_size] # truncated for safety
                })
                return chunks
    except Exception as e:
        logger.warning(f"AST chunking failed or unsupported, falling back to line chunking: {str(e)}")

    # Fallback: Line-based chunking
    lines = code.split('\n')
    current_chunk = []
    current_size = 0
    start_line = 1
    
    for i, line in enumerate(lines):
        line_size = len(line)
        if current_size + line_size > max_chunk_size and current_chunk:
            chunks.append({
                "type": "block",
                "start_line": start_line,
                "end_line": i,
                "code": '\n'.join(current_chunk)
            })
            current_chunk = []
            current_size = 0
            start_line = i + 1
            
        current_chunk.append(line)
        current_size += line_size
        
    if current_chunk:
        chunks.append({
            "type": "block",
            "start_line": start_line,
            "end_line": len(lines),
            "code": '\n'.join(current_chunk)
        })
        
    return chunks
