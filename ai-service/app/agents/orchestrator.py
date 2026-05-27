import asyncio
from typing import List, Dict, Any
import logging
from app.prompts.security_prompt import SECURITY_SYSTEM_PROMPT
from app.prompts.performance_prompt import PERFORMANCE_SYSTEM_PROMPT
from app.prompts.architecture_prompt import ARCHITECTURE_SYSTEM_PROMPT
from app.prompts.refactor_prompt import REFACTOR_SYSTEM_PROMPT
from app.prompts.clean_code_prompt import CLEAN_CODE_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

async def run_agent(agent_name: str, system_prompt: str, code: str, chunks: list = None) -> Dict[str, Any]:
    try:
        # Wrap the code input
        chunk_info = ""
        if chunks:
            chunk_info = f"\n\nThe code has {len(chunks)} structural components.\n"
            
        user_content = f"Analyze the following code:{chunk_info}\n\n```\n{code}\n```"
        
        from app.services.llm.router import route_agent_request
        
        result = await route_agent_request(
            agent_name=agent_name,
            system_prompt=system_prompt,
            user_content=user_content
        )
        
        # Ensure result has the expected structure
        # Calculate a dynamic confidence score
        # 1. Base confidence from the LLM model (simulated via strictness of prompt / score)
        # 2. Add some deterministic randomization to simulate "certainty" based on finding count
        base_confidence = 0.85
        issue_count = len(result.get("issues", []))
        llm_confidence = min(0.98, base_confidence + (issue_count * 0.02))
        
        return {
            "agent_name": agent_name,
            "score": result.get("score", 0),
            "summary": result.get("summary", "No summary provided."),
            "issues": result.get("issues", []),
            "confidence": round(llm_confidence * 100) # percentage
        }
    except Exception as e:
        logger.error(f"Error in {agent_name}: {str(e)}")
        return {
            "agent_name": agent_name,
            "score": 0,
            "summary": f"Failed to execute {agent_name} agent.",
            "issues": [],
            "confidence": 0
        }

async def orchestrate_review(code: str, chunks: list = None) -> List[Dict[str, Any]]:
    """
    Runs all specialized agents concurrently to analyze the code.
    Uses AST semantic chunks for deeper context.
    """
    agents = [
        ("Security", SECURITY_SYSTEM_PROMPT),
        ("Performance", PERFORMANCE_SYSTEM_PROMPT),
        ("Architecture", ARCHITECTURE_SYSTEM_PROMPT),
        ("Refactoring", REFACTOR_SYSTEM_PROMPT),
        ("Clean Code", CLEAN_CODE_SYSTEM_PROMPT)
    ]
    
    # Execute all agents in parallel
    logger.info("Starting multi-agent parallel orchestration...")
    tasks = [run_agent(name, prompt, code, chunks) for name, prompt in agents]
    results = await asyncio.gather(*tasks)
    logger.info("Parallel orchestration complete.")
    
    # Generate Executive Summary
    findings_payload = []
    for r in results:
        findings_payload.append(f"--- {r['agent_name']} ---")
        for i in r.get("issues", []):
            findings_payload.append(f"- [{i.get('severity', 'low').upper()}] {i.get('message', '')}")
            
    summary_prompt = f"""
    You are a Lead Staff Engineer reviewing a codebase. 
    Review the following AI agent findings and write a 1-2 sentence executive summary of the overall code quality and critical issues.
    Do not use markdown formatting, just plain text.
    
    FINDINGS:
    {chr(10).join(findings_payload)}
    """
    
    try:
        from app.services.llm.router import route_request
        summary_response = await route_request("Summarizer", summary_prompt, require_heavy=False)
        ai_summary = summary_response.strip()
    except Exception as e:
        logger.error(f"Failed to generate summary: {str(e)}")
        ai_summary = "Analysis complete. Review individual agent findings for details."
    
    return list(results), ai_summary
