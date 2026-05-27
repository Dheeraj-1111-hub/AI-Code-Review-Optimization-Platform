import asyncio
import logging
from typing import List, Dict, Any
from app.services.llm.router import route_agent_request
from app.agents.pr.prompts import (
    CTO_PROMPT, SECURITY_PROMPT, SENIOR_ENGINEER_PROMPT,
    PERFORMANCE_PROMPT, DEVOPS_PROMPT, ARCHITECT_PROMPT
)

logger = logging.getLogger(__name__)

async def run_pr_agent(agent_name: str, system_prompt: str, files: List[Dict[str, Any]], ai_config: Dict[str, Any]) -> Dict[str, Any]:
    try:
        # Format the diff for the prompt
        diff_context = ""
        for f in files:
            diff_context += f"File: {f.get('filename')}\nStatus: {f.get('status')}\n"
            diff_context += f"Patch:\n```diff\n{f.get('patch', '')}\n```\n\n"
            
        user_content = f"Analyze the following PR diff:\n\n{diff_context}"
        
        # Apply aiConfig configurations
        if ai_config.get("inlineReasoning") is True:
            system_prompt += "\n\nCRITICAL INSTRUCTION: You must include a detailed <chain_of_thought> explaining your reasoning inside your summary before you provide your verdict."
            
        if agent_name == "Senior Engineer" and "refactorAggression" in ai_config:
            system_prompt += f"\n\nCRITICAL INSTRUCTION: Use {ai_config['refactorAggression'].upper()} aggression for refactoring suggestions."

        # Pass the selected model down
        model_selection = ai_config.get("modelSelection", "gpt-4o")

        # We reuse the Heavy model for the Senior Engineer and CTO, instant for others if we want,
        # but for simplicity let's route to the general agent request wrapper.
        # Ensure we ask the router to output JSON.
        result = await route_agent_request(
            agent_name=agent_name,
            system_prompt=system_prompt,
            user_content=user_content,
            model_selection=model_selection
        )
        
        return {
            "agent": agent_name,
            "verdict": result.get("verdict", "COMMENT"),
            "summary": result.get("summary", "No summary provided."),
            "reasoning": result.get("reasoning", "No reasoning provided."),
            "findings": result.get("findings", []),
            "model_used": result.get("model_used", "Unknown Model")
        }
    except Exception as e:
        logger.error(f"Error in PR agent {agent_name}: {str(e)}")
        return {
            "agent": agent_name,
            "verdict": "COMMENT",
            "summary": f"Failed to execute {agent_name} agent.",
            "reasoning": str(e),
            "findings": [],
            "model_used": "Error"
        }

async def orchestrate_pr_simulation(files: List[Dict[str, Any]], ai_config: Dict[str, Any] = {}) -> List[Dict[str, Any]]:
    agents = [
        ("CTO", CTO_PROMPT),
        ("Security Lead", SECURITY_PROMPT),
        ("Senior Engineer", SENIOR_ENGINEER_PROMPT),
        ("Performance Engineer", PERFORMANCE_PROMPT),
        ("DevOps Engineer", DEVOPS_PROMPT),
        ("Staff Architect", ARCHITECT_PROMPT)
    ]
    
    # Execute agents sequentially to avoid Groq Free Tier TPM rate limits (429)
    results = []
    
    notify_drift = ai_config.get("notifyArchitectureDrift", False)
    block_security = ai_config.get("blockOnCriticalSecurity", True)
    
    for name, prompt in agents:
        if name == "Staff Architect" and not notify_drift:
            logger.info("Skipping Staff Architect as notifyArchitectureDrift is disabled")
            continue
            
        res = await run_pr_agent(name, prompt, files, ai_config)
        
        if name == "Security Lead" and res["verdict"] == "BLOCK" and not block_security:
            res["verdict"] = "REQUEST_CHANGES"
            res["summary"] += "\n(Note: Critical Security Block overridden to Request Changes by user preferences)."
            
        results.append(res)
        # Add a larger buffer delay to avoid Groq Free Tier TPM rate limits (429)
        await asyncio.sleep(4)
    
    return list(results)
