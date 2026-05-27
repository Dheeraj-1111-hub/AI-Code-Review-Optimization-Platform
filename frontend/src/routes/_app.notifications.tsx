import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/app/PageBits";
import { motion } from "framer-motion";
import { Sparkles, ShieldAlert, GitPullRequest, CheckCircle2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/notifications")({
  component: NotificationsPage,
});

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: "Performance Optimization",
    desc: "AI Engine found 2 optimizations in PR-402. Consider reviewing the memory allocation inside the core processor loop.",
    time: "2m ago",
    icon: Sparkles,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    unread: true,
    category: "AI Agent",
  },
  {
    id: 2,
    title: "Security Vulnerability",
    desc: "Critical injection flaw detected in core-auth. Immediate action required to prevent potential SQL injection vectors.",
    time: "15m ago",
    icon: ShieldAlert,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    unread: true,
    category: "Security",
  },
  {
    id: 3,
    title: "Review Completed",
    desc: "Architecture analysis for user-service finished. No major structural drift detected in the latest commits.",
    time: "1h ago",
    icon: CheckCircle2,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    unread: false,
    category: "System",
  },
  {
    id: 4,
    title: "New Pull Request",
    desc: "Alex opened a new pull request 'feat: implement notifications'.",
    time: "3h ago",
    icon: GitPullRequest,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    unread: false,
    category: "Repository",
  },
];

function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotifications = useMemo(() => {
    if (!searchQuery.trim()) return notifications;
    const query = searchQuery.toLowerCase();
    return notifications.filter(
      (n) => n.title.toLowerCase().includes(query) || n.desc.toLowerCase().includes(query) || n.category.toLowerCase().includes(query)
    );
  }, [notifications, searchQuery]);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="p-6 max-w-[1000px] mx-auto min-h-screen">
      <PageHeader
        title="Notifications"
        sub="Your complete history of alerts, reviews, and system events."
      />

      <div className="mt-8 flex flex-col gap-4">
        {/* Filters/Search Bar */}
        <div className="flex items-center justify-between mb-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#09090b] border border-[#1f1f23] rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>
          <button 
            onClick={handleMarkAllAsRead}
            className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            Mark all as read
          </button>
        </div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#09090b] border border-[#1f1f23] rounded-[16px] overflow-hidden"
        >
          {filteredNotifications.length === 0 && (
            <div className="p-8 text-center text-zinc-500 text-sm">
              No notifications found matching your search.
            </div>
          )}
          {filteredNotifications.map((notif, idx) => {
            const Icon = notif.icon;
            return (
              <div
                key={notif.id}
                className={cn(
                  "p-5 flex gap-4 hover:bg-[#111113] transition-colors cursor-pointer border-b border-[#1f1f23]/50 last:border-0 relative",
                  notif.unread ? "bg-[#111113]/50" : ""
                )}
              >
                {notif.unread && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                )}
                <div className={cn("mt-1 h-10 w-10 rounded-xl border flex items-center justify-center shrink-0", notif.bg, notif.border)}>
                  <Icon className={cn("h-5 w-5", notif.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm font-medium", notif.unread ? "text-zinc-100" : "text-zinc-300")}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {notif.category}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed max-w-3xl">
                    {notif.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
