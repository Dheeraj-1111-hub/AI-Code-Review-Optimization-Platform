from typing import List, Dict, Any

def calculate_final_scores(static_results: Dict[str, Any], agent_results: List[Dict[str, Any]]) -> Dict[str, int]:
    """
    Implements a Dynamic Penalty Scoring System.
    Base score is 100. Penalties are applied based on finding severity and AST complexity.
    """
    scores = {
        "securityScore": 100,
        "performanceScore": 100,
        "maintainabilityScore": 100,
        "architectureScore": 100,
        "overallScore": 100
    }

    # Severity weights
    PENALTY_MAP = {
        "critical": 40,
        "high": 15,
        "medium": 5,
        "low": 1
    }

    # Process all findings to deduct from specific domain scores
    for result in agent_results:
        agent_name = result.get("agent_name", "").lower()
        issues = result.get("issues", [])
        
        penalty = 0
        for issue in issues:
            severity = issue.get("severity", "low").lower()
            penalty += PENALTY_MAP.get(severity, 1)

        if "security" in agent_name:
            scores["securityScore"] = max(0, scores["securityScore"] - penalty)
        elif "performance" in agent_name:
            scores["performanceScore"] = max(0, scores["performanceScore"] - penalty)
        elif "clean code" in agent_name:
            scores["maintainabilityScore"] = max(0, scores["maintainabilityScore"] - penalty)
        elif "architecture" in agent_name:
            scores["architectureScore"] = max(0, scores["architectureScore"] - penalty)

    # Static AST penalties
    comp_score = static_results.get("complexity_score", 100)
    # Deduct complexity gap from maintainability
    if comp_score < 100:
        scores["maintainabilityScore"] = max(0, scores["maintainabilityScore"] - int((100 - comp_score) * 0.3))

    sec_score = static_results.get("security_score", 100)
    if sec_score < 100:
        scores["securityScore"] = max(0, scores["securityScore"] - int((100 - sec_score) * 0.3))

    # Overall Score is the average of the domain scores
    scores["overallScore"] = int(
        (scores["securityScore"] + scores["performanceScore"] + 
         scores["maintainabilityScore"] + scores["architectureScore"]) / 4
    )

    return scores
