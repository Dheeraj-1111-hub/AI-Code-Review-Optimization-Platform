import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity, GitPullRequest, ShieldAlert, TrendingUp, Sparkles, BrainCircuit, AlertTriangle, CheckCircle2, ShieldCheck, Network, Gauge, Server
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { PageHeader } from "@/components/app/PageBits";
import { useDashboardOverview } from "@/features/dashboard/api/get-dashboard";
import { useDashboardSockets } from "@/features/dashboard/hooks/useDashboardSockets";
import { useWorkspaceSettings } from "@/features/settings/hooks/useSettings";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { HoverEffect } from "@/components/ui/hover-effect";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Meteors } from "@/components/ui/meteors";
import { MovingBorder } from "@/components/ui/moving-border";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  // Fetch the real workspace so we can use its actual MongoDB _id
  const { data: workspaceData } = useWorkspaceSettings();
  const workspaceId = (workspaceData as any)?._id || '';

  const { data: dashboardData, isLoading, isError } = useDashboardOverview(workspaceId);
  useDashboardSockets(workspaceId);

  // Wait until workspaceId is resolved before showing loading skeleton
  if (!workspaceId || (workspaceId && isLoading && !dashboardData)) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-surface-hover rounded animate-pulse" />
            <div className="h-4 w-72 bg-surface rounded animate-pulse" />
          </div>
        </div>

        {/* AI Insight Skeleton */}
        <div className="h-28 w-full rounded-xl bg-surface/50 border border-border animate-pulse flex items-center p-6 gap-4">
          <div className="h-12 w-12 rounded-xl bg-surface-hover shrink-0" />
          <div className="space-y-3 flex-1">
            <div className="h-4 w-1/4 bg-surface-hover rounded" />
            <div className="h-5 w-3/4 bg-surface-hover rounded" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-surface/50 border border-border animate-pulse p-4 flex flex-col justify-between">
              <div className="h-3 w-1/2 bg-surface-hover rounded" />
              <div className="h-6 w-1/3 bg-surface-hover rounded" />
            </div>
          ))}
        </div>
        
        {/* Panels Skeleton */}
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
             <div className="h-64 rounded-xl bg-surface/50 border border-border animate-pulse" />
             <div className="h-48 rounded-xl bg-surface/50 border border-border animate-pulse" />
          </div>
          <div className="space-y-5">
             <div className="h-48 rounded-xl bg-surface/50 border border-border animate-pulse" />
             <div className="h-64 rounded-xl bg-surface/50 border border-border animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const { metrics, insights, trend, recentReviews, alerts, optimizationScore, repositoryHealth = [], systemHealth } = dashboardData as any;
  return (
    <div className="relative w-full h-full min-h-screen">
      <BackgroundBeams />
      <div className="relative z-10 p-6 max-w-[1400px] mx-auto min-h-screen">
      <PageHeader
        title="Mission control"
        sub="Live engineering health across your workspaces."
        action={
          <Link to="/pr-simulator" className="hidden md:inline-flex items-center gap-2 rounded-[16px] bg-[#fff] px-4 py-2 text-sm font-medium text-black hover:-translate-y-0.5 transition-transform duration-300">
            <GitPullRequest className="h-4 w-4" /> New review
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* === ROW 1: AI COMMAND CENTER (8) + QUICK STATS (4) === */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="lg:col-span-8 bg-[#09090b] border border-[#1f1f23] rounded-[16px] p-8 hover:border-[#2f2f35] transition duration-200 group flex flex-col h-full justify-between relative overflow-hidden"
        >
          <Meteors number={15} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                <BrainCircuit className="h-4 w-4 text-indigo-400" />
              </div>
              <h2 className="text-sm font-medium text-zinc-200">DevLens AI Engine</h2>
              <span className="text-zinc-600 mx-2">/</span>
              <p className="text-[11px] font-mono text-zinc-500">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} synchronization</p>
            </div>
            
            <TextGenerateEffect 
              words={insights.text}
              className="text-2xl md:text-3xl font-normal leading-tight max-w-2xl text-zinc-100"
            />
          </div>
          
          <div className="mt-8 flex flex-wrap items-center gap-3 relative z-10">
            {insights.tags.map((c: string) => (
              <span key={c} className="text-xs px-3 py-1.5 rounded-full border border-[#1f1f23] bg-zinc-900 text-zinc-400">{c}</span>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-4 grid grid-cols-2 gap-4"
        >
          <MovingBorder containerClassName="h-full" className="p-5 justify-between">
            <div className="mb-4">
              <div className="bg-blue-500/10 w-fit p-2 rounded-xl border border-blue-500/10"><GitPullRequest className="h-5 w-5 text-blue-400" /></div>
            </div>
            <div className="mt-auto">
              <div className="text-3xl font-light text-zinc-100">{metrics.reviewsThisWeek}</div>
              <div className="text-xs font-medium text-zinc-500 mt-1">Reviews this week</div>
            </div>
          </MovingBorder>
          <MovingBorder containerClassName="h-full" className="p-5 justify-between">
            <div className="mb-4">
              <div className="bg-emerald-500/10 w-fit p-2 rounded-xl border border-emerald-500/10"><ShieldCheck className="h-5 w-5 text-emerald-400" /></div>
            </div>
            <div className="mt-auto">
              <div className="text-3xl font-light text-zinc-100">{metrics.securityScore}</div>
              <div className="text-xs font-medium text-zinc-500 mt-1">Security Health</div>
            </div>
          </MovingBorder>
          <MovingBorder containerClassName="h-full" className="p-5 justify-between">
            <div className="mb-4">
              <div className="bg-purple-500/10 w-fit p-2 rounded-xl border border-purple-500/10"><Network className="h-5 w-5 text-purple-400" /></div>
            </div>
            <div className="mt-auto">
              <div className="text-3xl font-light text-zinc-100">{metrics.architectureHealth}</div>
              <div className="text-xs font-medium text-zinc-500 mt-1">Architecture</div>
            </div>
          </MovingBorder>
          <MovingBorder containerClassName="h-full" className="p-5 justify-between">
            <div className="mb-4">
              <div className="bg-amber-500/10 w-fit p-2 rounded-xl border border-amber-500/10"><Activity className="h-5 w-5 text-amber-400" /></div>
            </div>
            <div className="mt-auto">
              <div className="text-3xl font-light text-zinc-100">{metrics.avgScanTime}</div>
              <div className="text-xs font-medium text-zinc-500 mt-1">Avg Scan Time</div>
            </div>
          </MovingBorder>
        </motion.div>

        {/* === ROW 2: TREND (7) + OPTIMIZATION (5) === */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-7 bg-[#09090b] border border-[#1f1f23] rounded-[16px] p-6 flex flex-col hover:border-[#2f2f35] transition duration-200"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-medium text-zinc-100 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-zinc-400" /> Quality Trajectory</h3>
            <span className="text-xs font-mono text-zinc-500 px-2 py-1 rounded bg-[#111113] border border-[#1f1f23]">14 Days</span>
          </div>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="d" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#09090b", border: "1px solid #1f1f23", borderRadius: 12, fontSize: 12 }}
                  itemStyle={{ color: "#e4e4e7" }}
                />
                <Area type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorQuality)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-5 bg-[#09090b] border border-[#1f1f23] rounded-[16px] p-6 relative overflow-hidden flex flex-col justify-center items-center hover:border-[#2f2f35] transition duration-200"
        >
          <h3 className="absolute top-6 left-6 font-medium text-zinc-100 flex items-center gap-2 z-10"><Gauge className="h-4 w-4 text-zinc-400" /> Optimization</h3>
          
          <div className="relative h-48 w-48 mt-8">
            <svg viewBox="0 0 36 36" className="-rotate-90">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#1f1f23" strokeWidth="1.5" />
              <motion.circle
                cx="18" cy="18" r="16" fill="none"
                stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"
                initial={{ strokeDasharray: "0 100" }}
                animate={{ strokeDasharray: `${optimizationScore} 100` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                pathLength="100"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-light text-zinc-100">{optimizationScore}</span>
              <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-500 mt-1">Score</span>
            </div>
          </div>
          <div className="mt-6 text-center max-w-[250px] relative z-10">
            <p className="text-xs text-zinc-500">Derived autonomously from holistic performance and maintainability metrics.</p>
          </div>
        </motion.div>

        {/* === ROW 3: REVIEWS (6) + HEALTH & SYSTEM (6) === */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-6 bg-[#09090b] border border-[#1f1f23] rounded-[16px] p-6 flex flex-col h-[350px] hover:border-[#2f2f35] transition duration-200"
        >
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-medium text-zinc-100">Recent Reviews</h3>
            <Link to="/reviews" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">View all →</Link>
          </div>
          <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 -mx-2">
            {recentReviews.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center">
                <GitPullRequest className="h-8 w-8 text-zinc-700 mb-3" />
                <p className="text-sm font-medium text-zinc-300">No recent reviews</p>
              </div>
            ) : (
              <HoverEffect 
                items={recentReviews}
                className="grid-cols-1 gap-0.5"
                renderItem={(r: any) => (
                  <Link to={(r.id ? `/reviews/${r.id}` : "/dashboard") as any} className="flex items-center gap-4 cursor-pointer">
                    <div className="h-8 w-8 flex items-center justify-center shrink-0">
                      <GitPullRequest className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-zinc-200 group-hover:text-white transition-colors">{r.repo}</p>
                      <p className="text-xs text-zinc-500 font-mono truncate mt-0.5">{r.branch}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-mono text-sm tabular-nums font-medium text-zinc-300">{r.score}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider ${
                        r.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        r.status === "blocking" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  </Link>
                )}
              />
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-6 flex flex-col gap-6"
        >
          {/* Top Half: Repository Health */}
          <div className="bg-[#09090b] border border-[#1f1f23] rounded-[16px] p-6 flex-1 hover:border-[#2f2f35] transition duration-200">
            <h3 className="font-medium text-zinc-100 mb-4">Repository Health Map</h3>
            <div className="space-y-3">
              {repositoryHealth.length === 0 ? (
                <div className="text-sm text-zinc-500 italic text-center py-4">No repositories tracked yet.</div>
              ) : repositoryHealth.slice(0, 3).map((repo: any, idx: number) => (
                <div key={idx} className="group relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-zinc-200 truncate pr-4">{repo.repo}</span>
                    <span className="text-xs font-mono text-zinc-500">{repo.health}/100</span>
                  </div>
                  <div className="h-2 w-full bg-[#111113] rounded-full overflow-hidden border border-[#1f1f23]">
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: `${repo.health}%` }} transition={{ duration: 1, delay: 0.6 + (idx * 0.1) }}
                      className={`h-full rounded-full ${repo.health > 80 ? 'bg-emerald-500' : repo.health > 60 ? 'bg-amber-500' : 'bg-red-500'}`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Half: System Status split */}
          <div className="grid grid-cols-2 gap-6 h-[120px]">
            <CardSpotlight className="bg-[#09090b] border border-[#1f1f23] rounded-[16px] p-5 justify-center hover:border-[#2f2f35] transition duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-zinc-100 mb-1">Security Posture</h4>
                  <p className="text-xs text-zinc-500">{alerts.length === 0 ? "Zero critical alerts." : `${alerts.length} active alerts.`}</p>
                </div>
                <div>
                  {alerts.length === 0 ? (
                    <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/10"><ShieldCheck className="h-5 w-5 text-emerald-400" /></div>
                  ) : (
                    <div className="bg-red-500/10 p-2 rounded-xl border border-red-500/10"><AlertTriangle className="h-5 w-5 text-red-400" /></div>
                  )}
                </div>
              </div>
            </CardSpotlight>
            
            <CardSpotlight className="bg-[#09090b] border border-[#1f1f23] rounded-[16px] p-5 justify-center hover:border-[#2f2f35] transition duration-200">
              <h4 className="text-sm font-medium text-zinc-100 mb-3 flex items-center gap-2"><Server className="h-4 w-4 text-zinc-400" /> Infrastructure</h4>
              <ul className="space-y-2">
                <li className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">AI Service</span>
                  <span className="font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">OP</span>
                </li>
                <li className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Analysis DB</span>
                  <span className="font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">OP</span>
                </li>
              </ul>
            </CardSpotlight>
          </div>
        </motion.div>

      </div>
      </div>
    </div>
  );
}
