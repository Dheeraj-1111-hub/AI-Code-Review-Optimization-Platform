import { create } from 'zustand';

interface ReviewsState {
  filters: {
    status?: string;
    language?: string;
    search?: string;
  };
  setFilter: (key: 'status' | 'language' | 'search', value: string | undefined) => void;
  resetFilters: () => void;
}

export const useReviewsStore = create<ReviewsState>((set) => ({
  filters: {},
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),
  resetFilters: () => set({ filters: {} })
}));
