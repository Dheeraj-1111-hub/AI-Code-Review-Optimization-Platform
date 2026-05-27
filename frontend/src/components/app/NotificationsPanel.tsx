import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Sparkles, ShieldAlert, GitPullRequest, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { useNotifications } from "@/features/dashboard/hooks/useNotifications";


export const NotificationsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const { data: notifications = [], isLoading } = useNotifications();
  const unreadCount = notifications.filter((n: any) => n.unread).length;
  // If there are unread notifications, or just for visual effect, let's keep the dot if notifications exist
  const hasUnread = notifications.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative h-10 w-10 rounded-xl bg-[#09090b] border border-[#1f1f23] flex items-center justify-center transition-all duration-300 outline-none",
          isOpen ? "bg-[#111113] border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "hover:border-[#2f2f35] hover:bg-[#111113]"
        )}
        aria-label="Notifications"
      >
        <Bell className={cn("h-4 w-4 transition-colors duration-300", isOpen ? "text-indigo-400" : "text-zinc-400")} />
        {hasUnread && (
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute right-0 top-full mt-3 w-80 sm:w-96 rounded-[16px] bg-[#09090b]/95 backdrop-blur-3xl border border-[#1f1f23] shadow-2xl overflow-hidden z-50 origin-top-right"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f23]/50">
              <h3 className="text-sm font-medium text-zinc-100">Notifications</h3>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {unreadCount} New
              </span>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-zinc-500 animate-pulse">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-zinc-500">No notifications yet.</div>
              ) : (
                notifications.map((notif: any, idx: number) => {
                  let Icon = Sparkles;
                  let color = "text-indigo-400";
                  let bg = "bg-indigo-500/10";
                  let border = "border-indigo-500/20";
                  
                  if (notif.type?.includes('failed') || notif.type?.includes('vulnerability')) {
                    Icon = ShieldAlert;
                    color = "text-red-400";
                    bg = "bg-red-500/10";
                    border = "border-red-500/20";
                  } else if (notif.type?.includes('completed')) {
                    Icon = CheckCircle2;
                    color = "text-emerald-400";
                    bg = "bg-emerald-500/10";
                    border = "border-emerald-500/20";
                  }

                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.05, duration: 0.2 }}
                      className="group relative flex gap-4 p-3 rounded-xl hover:bg-[#111113] transition-colors cursor-pointer mb-1"
                    >
                      <div className={cn("mt-1 h-8 w-8 rounded-lg border flex items-center justify-center shrink-0", bg, border)}>
                        <Icon className={cn("h-4 w-4", color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className={cn("text-sm font-medium truncate", notif.unread ? "text-zinc-100" : "text-zinc-300")}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-zinc-500 shrink-0 mt-0.5 whitespace-nowrap pl-2">
                            {format(new Date(notif.time), 'MMM dd, yyyy h:mm a')}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                          {notif.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            <div className="p-3 border-t border-[#1f1f23]/50">
              <Link to="/notifications" onClick={() => setIsOpen(false)} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-[#111113] text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
                View all notifications <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
