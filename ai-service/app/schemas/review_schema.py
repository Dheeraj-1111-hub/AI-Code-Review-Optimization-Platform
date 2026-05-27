from pydantic import BaseModel, Field
from typing import List, Optional

class CodeInput(BaseModel):
    code: str
    language: str
    filename: Optional[str] = "unknown"

class AgentIssue(BaseModel):
    line: Optional[int] = None
    severity: str # "high", "medium", "low"
    message: str
    suggestion: Optional[str] = None

class AgentResult(BaseModel):
    agent_name: str
    score: int
    issues: List[AgentIssue]
    summary: str

class FinalReviewResponse(BaseModel):
    securityScore: int
    performanceScore: int
    maintainabilityScore: int
    architectureScore: int
    overallScore: int
    agentResults: List[AgentResult]
