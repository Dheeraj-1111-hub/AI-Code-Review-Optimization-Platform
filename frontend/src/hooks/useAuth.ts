import { useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useAuthStore } from '../store/auth.store';
import { setTokenGetter } from '../services/api/client';

export function useCustomAuth() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { getToken, signOut } = useClerkAuth();
  const { user: backendUser, isSynced, syncUser, clearUser } = useAuthStore();

  // Register token getter globally for Axios interceptor
  setTokenGetter(getToken);

  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser && !isSynced) {
      // Sync user with backend once they sign in
      syncUser(clerkUser);
    } else if (isLoaded && !isSignedIn && isSynced) {
      // Clear store if signed out
      clearUser();
    }
  }, [isLoaded, isSignedIn, clerkUser, isSynced, syncUser, clearUser]);

  return {
    isLoaded,
    isSignedIn,
    clerkUser,
    backendUser,
    isSynced,
    getToken,
    signOut,
  };
}
