import React, { useEffect } from 'react';
import { useAuth, RedirectToSignIn, useUser } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const { isSynced, syncUser } = useAuthStore();

  useEffect(() => {
    if (isSignedIn && clerkUser && !isSynced) {
      syncUser(clerkUser);
    }
  }, [isSignedIn, clerkUser, isSynced, syncUser]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
        <p className="text-white/50 text-sm animate-pulse">Initializing Environment...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  // Optionally wait for sync before showing children
  if (!isSynced) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-white/70 text-sm">Syncing Developer Profile...</p>
      </div>
    );
  }

  return <>{children}</>;
}
