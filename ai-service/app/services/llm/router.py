import logging
from app.services.groq_service import generate_structured_response as groq_structured, generate_text_response as groq_text

logger = logging.getLogger(__name__)

async def route_agent_request(agent_name: str, system_prompt: str, user_content: str, model_selection: str = "gpt-4o") -> dict:
    """
    Dynamically routes LLM requests based on the agent's task.
    In a full enterprise environment, this routes between OpenAI, Anthropic, Gemini, Groq.
    For this phase, we use specific models within Groq based on task complexity.
    """
    
    # Define model routing logic based on agent complexity
    # Complex architectural/security reasoning needs a larger model
    heavy_agents = ["Security", "Architecture", "Refactoring", "CTO", "Security Lead", "Staff Architect"]
    fast_agents = ["Performance", "Clean Code", "Performance Engineer", "Senior Engineer", "DevOps Engineer"]
    
    try:
        # Determine base model requirement based on agent complexity
        is_heavy_agent = agent_name in heavy_agents

        # Apply model routing based on user preference
        if model_selection == "llama-3":
            # Lowest latency: force everything to 8b
            model = "llama-3.1-8b-instant"
            reported_model = "Llama 3 (8B)"
        elif model_selection == "claude-3.5":
            # Claude 3.5 is great at refactoring, we simulate it with 70b
            model = "llama-3.3-70b-versatile" if is_heavy_agent else "llama-3.1-8b-instant"
            reported_model = "Claude 3.5 Sonnet (Simulated)"
        else:
            # Default to gpt-4o (Best reasoning)
            model = "llama-3.3-70b-versatile" if is_heavy_agent else "llama-3.1-8b-instant"
            reported_model = "GPT-4o (Simulated)"

        logger.info(f"Routing {agent_name} to model: {model} (Preference: {model_selection})")
            
        # Execute the request
        result = await groq_structured(system_prompt, user_content, model=model)
        
        # Inject the model used for UI reporting
        result["model_used"] = reported_model
        return result
        
    except Exception as e:
        logger.error(f"Router error for {agent_name}: {str(e)}")
        raise e

async def route_request(agent_name: str, user_content: str, require_heavy: bool = False) -> str:
    """
    Dynamically routes plain text LLM requests.
    """
    model = "llama-3.3-70b-versatile" if require_heavy else "llama-3.1-8b-instant"
    logger.info(f"Routing text request {agent_name} to model: {model}")
    
    return await groq_text(
        system_prompt="You are a helpful engineering assistant.",
        user_content=user_content,
        model=model
    )
