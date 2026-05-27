import { create } from 'zustand';

export type AgentStatus = 'idle' | 'analyzing' | 'completed' | 'failed';

export interface AgentResult {
  agent_name: string;
  score: number;
  summary: string;
  issues: any[];
}

export interface ReviewScore {
  securityScore: number;
  performanceScore: number;
  maintainabilityScore: number;
  architectureScore: number;
  overallScore: number;
}

interface AIState {
  isStreaming: boolean;
  statusMessage: string;
  agentResults: AgentResult[];
  scores: ReviewScore | null;
  staticIssues: any[];
  
  // Actions
  setStreaming: (status: boolean) => void;
  setStatusMessage: (message: string) => void;
  setCompleteResult: (result: any) => void;
  resetStream: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  isStreaming: false,
  statusMessage: 'Ready',
  agentResults: [],
  scores: null,
  staticIssues: [],

  setStreaming: (status) => set({ isStreaming: status }),
  setStatusMessage: (message) => set({ statusMessage: message }),
  
  setCompleteResult: (result) => set({ 
    isStreaming: false,
    statusMessage: 'Review Complete',
    agentResults: result.agentResults || [],
    scores: {
      securityScore: result.securityScore || 0,
      performanceScore: result.performanceScore || 0,
      maintainabilityScore: result.maintainabilityScore || 0,
      architectureScore: result.architectureScore || 0,
      overallScore: result.overallScore || 0,
    },
    staticIssues: result.staticIssues || []
  }),
  
  resetStream: () => set({
    isStreaming: false,
    statusMessage: 'Ready',
    agentResults: [],
    scores: null,
    staticIssues: []
  })
}));
