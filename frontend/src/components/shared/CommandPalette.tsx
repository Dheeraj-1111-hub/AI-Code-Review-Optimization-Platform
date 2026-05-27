import * as React from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Code2, GitPullRequest, Terminal, Settings, LayoutDashboard, BarChart3 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useCommandPalette } from "@/hooks/use-command-palette";

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, [setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <Command.Dialog
          open={open}
          onOpenChange={setOpen}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh]"
          label="Global Command Menu"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-50 w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl mx-4"
          >
            <div className="flex items-center border-b border-border px-4 py-3">
              <Search className="mr-3 h-5 w-5 text-muted-foreground" />
              <Command.Input
                placeholder="Search repos, reviews, or commands..."
                className="flex h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 font-sans"
              />
            </div>
            <Command.List className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </Command.Empty>

              <Command.Group heading="Navigation" className="text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2">
                {[
                  { label: "Dashboard",        to: "/dashboard",    icon: LayoutDashboard },
                  { label: "Reviews",          to: "/reviews",      icon: GitPullRequest },
                  { label: "Repositories",     to: "/repositories", icon: Code2 },
                  { label: "Review Workspace", to: "/review",       icon: Terminal },
                  { label: "Analytics",        to: "/analytics",    icon: BarChart3 },
                  { label: "Settings",         to: "/settings",     icon: Settings },
                ].map(({ label, to, icon: Icon }) => (
                  <Command.Item
                    key={to}
                    onSelect={() => runCommand(() => navigate({ to }))}
                    className="relative flex cursor-default select-none items-center rounded-md px-2 py-2.5 text-sm text-foreground outline-none aria-selected:bg-primary/10 aria-selected:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{label}</span>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading="Actions" className="text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 mt-2">
                <Command.Item
                  onSelect={() => runCommand(() => console.log("Run AI Analysis"))}
                  className="relative flex cursor-default select-none items-center rounded-md px-2 py-2.5 text-sm text-foreground outline-none aria-selected:bg-primary/10 aria-selected:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <Terminal className="mr-2 h-4 w-4" />
                  <span>Start AI Analysis</span>
                  <span className="ml-auto text-xs tracking-widest text-muted-foreground">⌘A</span>
                </Command.Item>
                <Command.Item
                  onSelect={() => runCommand(() => navigate({ to: "/settings" }))}
                  className="relative flex cursor-default select-none items-center rounded-md px-2 py-2.5 text-sm text-foreground outline-none aria-selected:bg-primary/10 aria-selected:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                  <span className="ml-auto text-xs tracking-widest text-muted-foreground">⌘S</span>
                </Command.Item>
              </Command.Group>
            </Command.List>
          </motion.div>
        </Command.Dialog>
      )}
    </AnimatePresence>
  );
}
