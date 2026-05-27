import { createFileRoute } from '@tanstack/react-router';
import { SignIn } from '@clerk/clerk-react';
import { GridBackground } from '@/components/ui/grid-background';

export const Route = createFileRoute('/login')({
  component: LoginComponent,
});

function LoginComponent() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <GridBackground variant="grid" className="opacity-40" maskFade={true} />
      
      {/* Abstract Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md px-4 flex flex-col items-center">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-white mb-4 flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)]">
            <span className="text-black font-bold text-2xl leading-none">C</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-gradient text-center">Welcome Back</h1>
          <p className="text-muted-foreground mt-2 text-center">Sign in to DevLens AI</p>
        </div>

        <SignIn 
          signUpUrl="/signup" 
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
