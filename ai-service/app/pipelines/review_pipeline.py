import logging
from typing import Dict, Any
from app.analyzers.static_analysis import run_static_analysis
from app.agents.orchestrator import orchestrate_review
from app.pipelines.scoring_pipeline import calculate_final_scores
from app.services.parsing.language_detector import detect_language
from app.services.parsing.chunking import semantic_chunk_code

logger = logging.getLogger(__name__)

async def run_full_review(code: str, language: str) -> Dict[str, Any]:
    """
    Executes the entire review pipeline:
    1. Static Analysis
    2. Multi-Agent AI Analysis
    3. Score Aggregation
    """
    # 1. Detect Language if not explicitly provided
    detected_lang = language if language else detect_language(code)
    logger.info(f"Starting review pipeline for {detected_lang} code...")
    
    # 2. Semantic Chunking & AST Parsing
    chunks = semantic_chunk_code(code, detected_lang)
    logger.info(f"Code split into {len(chunks)} semantic chunks.")
    
    # 3. Run Static Analysis
    static_results = run_static_analysis(code, detected_lang)
    
    # 4. Run Multi-Agent Orchestration (passing full code for now, chunks can be passed inside)
    # We pass the semantic chunks as context to the orchestrator
    agent_results, ai_summary = await orchestrate_review(code, chunks)
    
    # 3. Calculate Final Scores
    scores = calculate_final_scores(static_results, agent_results)
    
    # Compile Final Response
    return {
        "securityScore": scores["securityScore"],
        "performanceScore": scores["performanceScore"],
        "maintainabilityScore": scores["maintainabilityScore"],
        "architectureScore": scores["architectureScore"],
        "overallScore": scores["overallScore"],
        "aiSummary": ai_summary,
        "agentResults": agent_results,
        "staticIssues": static_results["issues"]
    }
