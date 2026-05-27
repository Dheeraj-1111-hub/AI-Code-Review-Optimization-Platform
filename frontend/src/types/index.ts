// ─── Review Types ──────────────────────────────────────────────────────────

export type AgentName = "Security" | "Performance" | "Architecture" | "Refactoring" | "Clean Code";

export type IssueSeverity = "high" | "medium" | "low";

export interface ReviewIssue {
  line?: number;
  severity: IssueSeverity;
  message: string;
  suggestion?: string;
}

export interface AgentResult {
  agent_name: AgentName;
  score: number;
  summary: string;
  issues: ReviewIssue[];
}

export interface ReviewScores {
  securityScore: number;
  performanceScore: number;
  maintainabilityScore: number;
  architectureScore: number;
  overallScore: number;
}

export interface Review extends ReviewScores {
  _id: string;
  userId: string;
  codeInput: string;
  language: string;
  status: "pending" | "analyzing" | "completed" | "failed";
  agentResults: AgentResult[];
  staticIssues: ReviewIssue[];
  createdAt: string;
  updatedAt: string;
}

// ─── Repository Types ──────────────────────────────────────────────────────

export interface Repository {
  _id: string;
  name: string;
  fullName: string;
  language: string;
  healthScore: number;
  lastReviewAt?: string;
  description?: string;
}

// ─── User Types ────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  clerkId: string;
  email: string;
  name: string;
  avatar?: string;
  role: "owner" | "admin" | "reviewer" | "viewer";
}

// ─── API Types ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ─── UI State ──────────────────────────────────────────────────────────────

export type LoadingState = "idle" | "loading" | "success" | "error";
export type ReviewStatus = "idle" | "analyzing" | "completed" | "failed";
