import * as React from "react";
import { Outlet } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { GridBackground } from "@/components/ui/grid-background";

export function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative bg-black overflow-hidden">
      
      {/* Left side: Content / Forms */}
      <div className="flex flex-col justify-center items-center p-8 z-10 w-full max-w-md mx-auto h-full relative">
        {/* Subtle dot pattern for the form side */}
        <GridBackground variant="dot" className="opacity-20" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full space-y-8 relative z-10"
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-black font-bold text-lg leading-none">C</span>
            </div>
            <span className="text-xl font-heading font-bold tracking-tight">CodeReview<span className="text-muted-foreground">.ai</span></span>
          </div>

          {/* Router Outlet for actual auth forms */}
          <Outlet />

        </motion.div>
      </div>

      {/* Right side: Minimalist Tech Aesthetic (Hidden on mobile) */}
      <div className="hidden lg:flex relative bg-[#050505] border-l border-white/5 items-center justify-center p-12 overflow-hidden">
        <GridBackground variant="grid" className="opacity-30" maskFade={false} />
        
        {/* Abstract code representation */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <div className="w-[120%] h-[120%] bg-[linear-gradient(0deg,transparent_24%,rgba(255,255,255,.3)_25%,rgba(255,255,255,.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.3)_75%,rgba(255,255,255,.3)_76%,transparent_77%,transparent)] bg-[length:50px_50px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 max-w-lg border border-white/10 bg-black p-10 rounded-3xl shadow-2xl"
        >
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6">
            <span className="text-white">⚡</span>
          </div>
          <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
            Zero friction code reviews.
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            Connect your repository and let our AI handle the routine checks, so your senior engineers can focus on architecture.
          </p>
          
          {/* Mock terminal interface */}
          <div className="rounded-lg bg-[#0a0a0a] border border-white/10 p-4 font-mono text-xs text-muted-foreground">
            <div className="flex gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            </div>
            <p><span className="text-white">❯</span> git push origin main</p>
            <p className="text-success mt-1">✓ Automated review complete (2s)</p>
            <p className="mt-1">  - 1 security vulnerability prevented</p>
            <p>  - 3 style improvements suggested</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
