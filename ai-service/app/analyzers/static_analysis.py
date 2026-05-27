import tempfile
import subprocess
import os
import json
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

def run_static_analysis(code: str, language: str) -> Dict[str, Any]:
    """
    Runs deterministic static analysis tools on the code.
    For Python: radon (complexity) and bandit (security).
    For JS/TS: we can add eslint wrapper later.
    """
    results = {
        "complexity_score": 100,
        "security_score": 100,
        "issues": []
    }
    
    if language.lower() not in ["python", "py"]:
        # Skip static analysis for non-python for now unless we add eslint
        return results

    try:
        # Create a temporary file to run the tools on
        with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode="w") as tmp:
            tmp.write(code)
            tmp_path = tmp.name

        # Run Radon for Cyclomatic Complexity
        try:
            radon_result = subprocess.run(
                ["radon", "cc", "-s", "-j", tmp_path],
                capture_output=True,
                text=True,
                timeout=5
            )
            if radon_result.stdout:
                radon_data = json.loads(radon_result.stdout)
                file_data = radon_data.get(tmp_path, [])
                if file_data:
                    # Calculate a rough score based on complexity
                    max_complexity = max([item.get("complexity", 1) for item in file_data if isinstance(item, dict)])
                    results["complexity_score"] = max(0, 100 - (max_complexity * 2))
                    for item in file_data:
                        if isinstance(item, dict) and item.get("complexity", 0) > 10:
                            results["issues"].append({
                                "severity": "medium",
                                "message": f"High cyclomatic complexity ({item.get('complexity')}) in {item.get('type')} '{item.get('name')}'.",
                                "line": item.get("lineno")
                            })
        except Exception as e:
            logger.error(f"Radon execution failed: {str(e)}")

        # Run Bandit for Security
        try:
            bandit_result = subprocess.run(
                ["bandit", "-f", "json", "-q", tmp_path],
                capture_output=True,
                text=True,
                timeout=5
            )
            if bandit_result.stdout:
                bandit_data = json.loads(bandit_result.stdout)
                bandit_issues = bandit_data.get("results", [])
                if bandit_issues:
                    results["security_score"] = max(0, 100 - (len(bandit_issues) * 10))
                    for issue in bandit_issues:
                        results["issues"].append({
                            "severity": issue.get("issue_severity", "low").lower(),
                            "message": f"Bandit [{issue.get('issue_id')}]: {issue.get('issue_text')}",
                            "line": issue.get("line_number")
                        })
        except Exception as e:
            logger.error(f"Bandit execution failed: {str(e)}")

    except Exception as e:
        logger.error(f"Static analysis failed: {str(e)}")
    finally:
        if 'tmp_path' in locals() and os.path.exists(tmp_path):
            os.remove(tmp_path)

    return results
