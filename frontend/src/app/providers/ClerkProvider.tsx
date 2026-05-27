import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#6366f1', // Electric Indigo to match our theme
          colorBackground: '#141417',
          colorInputBackground: '#1c1c1f',
          colorInputText: '#ffffff',
          colorText: '#ffffff',
          colorTextSecondary: '#a1a1aa',
        },
        elements: {
          card: 'bg-black/40 border border-white/10 backdrop-blur-md rounded-xl',
          headerTitle: 'text-2xl font-bold text-gradient',
          headerSubtitle: 'text-muted-foreground',
          formButtonPrimary: 'bg-indigo-500 hover:bg-indigo-600 transition-colors',
          footerActionLink: 'text-indigo-400 hover:text-indigo-300',
        }
      }}
    >
      {children}
    </BaseClerkProvider>
  );
}
