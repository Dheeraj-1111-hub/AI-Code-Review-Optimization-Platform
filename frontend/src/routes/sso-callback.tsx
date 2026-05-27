import { createFileRoute } from '@tanstack/react-router';
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/sso-callback')({
  component: SSOCallbackComponent,
});

function SSOCallbackComponent() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      <p className="text-white/70 text-sm">Authenticating...</p>
      <AuthenticateWithRedirectCallback 
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
      />
    </div>
  );
}
