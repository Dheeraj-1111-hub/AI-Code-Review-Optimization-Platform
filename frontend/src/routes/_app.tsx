import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Command, Cpu, UserCircle, Users } from "lucide-react";
import { Logo } from "@/components/Logo";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { CopilotWorkspace } from "@/components/copilot/CopilotWorkspace";
import { NAV_ITEMS } from "@/constants/navigation";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { useCopilot } from "@/hooks/useCopilot";
import { useUser, UserButton } from "@clerk/clerk-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { NotificationsPanel } from "@/components/app/NotificationsPanel";
import { MovingBorder } from "@/components/ui/moving-border";
export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <>
      <CommandPalette />
      <div className="h-screen overflow-hidden bg-background text-foreground flex flex-col">
        <Topbar />
        <div className="flex-1 flex min-h-0 relative">
          <DesktopSidebar />
          <div className="flex-1 flex flex-col min-w-0 h-full relative">
            <main className="flex-1 overflow-auto custom-scrollbar">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
      <CopilotWorkspace />
    </>
  );
}

function DesktopSidebar() {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar h-full">

      <nav
        className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar"
        aria-label="Main navigation"
      >
        <div className="mb-4 px-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Workspace</p>
        </div>
        {NAV_ITEMS.map((item) => (
          <DesktopNavItem key={item.to} item={item} />
        ))}
      </nav>

    </aside>
  );
}

function DesktopNavItem({ item }: { item: typeof NAV_ITEMS[0] }) {
  const hasChildren = !!item.children?.length;

  return (
    <div className="space-y-1">
      <Link
        to={item.to}
        activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
        inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50" }}
        className={cn(
          "group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{item.label}</span>
        </div>
      </Link>
      
      {hasChildren && (
        <div className="pl-9 space-y-1 mt-1">
          {item.children!.map((child) => (
            <Link
              key={child.label}
              to={child.to as any}
              params={child.params}
              activeProps={{ className: "text-electric font-medium bg-sidebar-accent/30" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              className="block rounded-md px-3 py-1.5 text-xs transition-colors"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Topbar() {
  const { toggle } = useCommandPalette();
  const { toggleOpen } = useCopilot();
  const { user } = useUser();
  const [hasUnread, setHasUnread] = useState(true);

  return (
    <header
      className="h-16 shrink-0 border-b border-[#1f1f23]/50 bg-[#09090b]/40 backdrop-blur-3xl flex items-center px-4 md:px-6 gap-4 sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)] w-full"
      role="banner"
    >
      {/* Logo for Desktop */}
      <div className="hidden md:flex items-center w-56 shrink-0">
        <Logo to="/dashboard" />
      </div>

      {/* Mobile sidebar trigger */}
      <MobileSidebar />

      {/* Search / Command Palette trigger */}
      <div className="flex-1">
        <MovingBorder containerClassName="w-full h-[40px] rounded-xl" className="bg-[#09090b]/80 backdrop-blur-xl" borderWidth="1px">
          <button
            onClick={toggle}
            className="w-full h-full relative flex items-center gap-3 pl-3 pr-3 text-sm text-zinc-400 hover:text-zinc-200 transition-colors duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Open command palette (⌘K)"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[15px]" />
            <svg className="h-4 w-4 shrink-0 text-zinc-500 group-hover:text-indigo-400 transition-colors z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden sm:block flex-1 text-left z-10 transition-colors">Search repos, files, reviews…</span>
            <span className="flex items-center gap-0.5 text-[10px] font-mono text-zinc-500 border border-[#1f1f23] bg-[#111113] rounded px-1.5 py-0.5 shrink-0 z-10 group-hover:border-indigo-500/30 group-hover:text-indigo-400 transition-colors">
              <Command className="h-3 w-3" aria-hidden="true" />K
            </span>
          </button>
        </MovingBorder>
      </div>

      {/* Notifications */}
      <NotificationsPanel />

      {/* AI Assistant */}
      <button onClick={toggleOpen} className="hidden sm:flex items-center gap-2 rounded-xl bg-[#09090b] border border-[#1f1f23] px-4 py-2 text-sm hover:border-zinc-700 hover:bg-zinc-800/50 transition-all duration-300 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700 group relative outline-none cursor-pointer">
        <div className="bg-zinc-800 p-1 rounded border border-zinc-700/50 shadow-sm">
          <Cpu className="h-3 w-3 text-zinc-400 group-hover:text-zinc-300 transition-colors" strokeWidth={1.5} />
        </div>
        <span className="font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">AI Assistant</span>
      </button>

      {/* User avatar */}
      {/* User avatar */}
      <div className="relative rounded-full border border-[#1f1f23] hover:border-[#2f2f35] shrink-0 cursor-pointer transition-colors">
        <div className="h-9 w-9 rounded-full bg-background flex items-center justify-center overflow-hidden">
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-9 h-9"
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}

