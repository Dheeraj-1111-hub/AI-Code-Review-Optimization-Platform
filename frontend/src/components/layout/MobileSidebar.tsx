import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";
import { NAV_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — only visible on mobile */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-surface/60 hover:bg-surface transition"
        aria-label="Open navigation menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-sidebar border-r border-sidebar-border md:hidden"
            >
              {/* Header */}
              <div className="h-16 flex items-center justify-between px-5 border-b border-sidebar-border shrink-0">
                <Logo to="/dashboard" />
                <button
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-sidebar-accent transition"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
                    inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50" }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
