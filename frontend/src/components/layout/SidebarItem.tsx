import * as React from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: number | string;
}

export function SidebarItem({ icon, label, to, badge }: SidebarItemProps) {
  // Try to use useLocation, but default to inactive if we can't (for storybooks/tests outside router context)
  let isActive = false;
  try {
    const location = useLocation();
    isActive = location.pathname === to || location.pathname.startsWith(to + "/");
  } catch (e) {
    isActive = false;
  }

  return (
    <Link
      to={to as any}
      className={cn(
        "group relative flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "transition-colors",
            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}
        >
          {icon}
        </span>
        <span>{label}</span>
      </div>

      {badge && (
        <span className="flex h-5 items-center justify-center rounded-full bg-primary/20 px-2 text-[10px] font-bold text-primary">
          {badge}
        </span>
      )}

      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 h-full w-1 rounded-r-full bg-primary"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );
}
