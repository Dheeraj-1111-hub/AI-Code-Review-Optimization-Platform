import * as React from "react";
import { Outlet } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Code2, 
  GitPullRequest, 
  Settings, 
  Bell, 
  Menu,
  X
} from "lucide-react";
import { SidebarItem } from "@/components/layout/SidebarItem";
import { SearchBar } from "@/components/shared/SearchBar";
import { Button } from "@/components/ui/button";
import { GridBackground } from "@/components/ui/grid-background";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

export function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const sidebarContent = (
    <>
      <div className="flex h-16 shrink-0 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm bg-white flex items-center justify-center">
            <span className="text-black font-bold text-lg leading-none">C</span>
          </div>
          <span className="text-xl font-heading font-bold tracking-tight">CodeReview<span className="text-muted-foreground">.ai</span></span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto custom-scrollbar">
        <div className="mb-6 space-y-1">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Overview
          </p>
          <SidebarItem to="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" />
          <SidebarItem to="/repositories" icon={<Code2 className="h-5 w-5" />} label="Repositories" badge={3} />
          <SidebarItem to="/reviews" icon={<GitPullRequest className="h-5 w-5" />} label="Code Reviews" />
        </div>
        
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Settings
          </p>
          <SidebarItem to="/settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
        </div>
      </nav>
      
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface border border-white/5">
          <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center overflow-hidden">
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="opacity-90 grayscale hover:grayscale-0 transition-all" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-foreground truncate">Alex Developer</p>
            <p className="text-xs text-muted-foreground truncate">Workspace Admin</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-black overflow-hidden relative selection:bg-white/20">
      <GridBackground variant="dot" className="opacity-30" maskFade={true} />

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col border-r border-white/10 bg-[#050505] relative z-20">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#050505] border-r border-white/10 z-50 flex flex-col lg:hidden shadow-2xl"
            >
              <div className="absolute right-4 top-4">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        {/* Top Navbar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-white/10 bg-black/50 backdrop-blur-md">
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5 text-muted-foreground" />
            </Button>
            <div className="w-full max-w-md hidden sm:block">
              <SearchBar placeholder="Search repos, reviews, commands..." />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-white pulse-ring" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="px-4 py-8 sm:px-6 lg:px-8 mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
