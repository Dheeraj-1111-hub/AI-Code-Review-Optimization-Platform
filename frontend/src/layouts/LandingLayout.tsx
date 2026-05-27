import * as React from "react";
import { Outlet, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { GridBackground } from "@/components/ui/grid-background";

export function LandingLayout() {
  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-white/20 flex flex-col relative overflow-hidden">
      {/* Aceternity Background */}
      <GridBackground variant="grid" className="opacity-40" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-black font-bold text-lg leading-none">C</span>
            </div>
            <span className="text-xl font-heading font-bold tracking-tight">CodeReview<span className="text-muted-foreground">.ai</span></span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Features</a>
            <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button variant="aceternity" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 relative z-10 flex flex-col items-center justify-center">
        <Outlet />
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-white/5 bg-black py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
              <span className="text-xs font-bold text-white">C</span>
            </div>
            <span className="text-sm font-medium">© 2026 CodeReview.ai</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
