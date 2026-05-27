import { create } from 'zustand';
import { api } from '../services/api/client';

export interface User {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
  isSynced: boolean;
  syncUser: (clerkUser: any) => Promise<void>;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isSynced: false,

  syncUser: async (clerkUser) => {
    try {
      // clerkUser is the object from useUser()
      const response = await api.post('/v1/users/sync', {
        id: clerkUser.id,
        primaryEmailAddress: clerkUser.primaryEmailAddress,
        username: clerkUser.username,
        imageUrl: clerkUser.imageUrl,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
      });
      set({ user: response.data, isSynced: true });
    } catch (error) {
      console.error('User sync failed', error);
      set({ isSynced: false });
    }
  },

  clearUser: () => {
    set({ user: null, isSynced: false });
  },
}));
