import { create } from 'zustand';
import type { Review } from '@/types';

interface ReviewState {
  currentReview: Review | null;
  setCurrentReview: (review: Review | null) => void;
  updateReviewAgentResult: (agentResult: any) => void;
  updateReviewStatus: (status: Review['status']) => void;
  clearReview: () => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
  currentReview: null,
  
  setCurrentReview: (review) => set({ currentReview: review }),
  
  updateReviewAgentResult: (agentResult) => set((state) => {
    if (!state.currentReview) return state;
    
    // Check if we already have this agent's result, if so replace, else append
    const existingIndex = state.currentReview.agentResults.findIndex(
      r => r.agent_name === agentResult.agent_name
    );
    
    const newResults = [...state.currentReview.agentResults];
    if (existingIndex >= 0) {
      newResults[existingIndex] = agentResult;
    } else {
      newResults.push(agentResult);
    }
    
    return {
      currentReview: {
        ...state.currentReview,
        agentResults: newResults,
      }
    };
  }),

  updateReviewStatus: (status) => set((state) => {
    if (!state.currentReview) return state;
    return {
      currentReview: {
        ...state.currentReview,
        status,
      }
    };
  }),
  
  clearReview: () => set({ currentReview: null }),
}));
