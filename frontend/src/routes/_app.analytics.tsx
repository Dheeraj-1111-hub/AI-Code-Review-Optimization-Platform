import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, StatCard } from "@/components/app/PageBits";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Clock, GitPullRequest, GitMerge, AlertTriangle, Shield, CheckCircle2, RefreshCw } from "lucide-react";
import { useAnalytics, useGenerateAnalytics } from "@/features/analytics/hooks/useAnalytics";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/analytics")({
  component: Analytics,
});

function Analytics() {
  const { data, isLoading, refetch } = useAnalytics();
  const { mutate: generate, isPending: isGenerating } = useGenerateAnalytics();

  if (isLoading) {
    return <div className="p-10 text-center text-muted-foreground animate-pulse">Loading Engineering Analytics...</div>;
  }

  if (!data || !data.overview) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Insufficient data to generate analytics. Run a repository scan first.
      </div>
    );
  }

  const { overview, findingsByCategory, repositoryHealth, topIssues, recentEvents, history } = data;

  // Format charts
  const trendChart = (history || []).map((s: any) => ({
    d: format(new Date(s.generatedAt), "MMM d"),
    score: s.qualityScore,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex items-start justify-between">
        <PageHeader 
          title="Engineering Analytics" 
          sub="Track code health and review intelligence across repositories." 
        />
        <button
          onClick={() => { generate(); refetch(); }}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 rounded-lg bg-surface-elevated px-4 py-2 text-sm font-medium border border-border hover:bg-surface-elevated/80 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Syncing Data...' : 'Refresh Metrics'}
        </button>
      </div>

      {/* ROW 1: KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Repositories Scanned" value={overview.repositoriesScanned?.toString()} delta="Active" accent="electric" />
        <StatCard label="PRs Reviewed" value={overview.prsReviewed?.toString()} delta="This period" accent="electric" />
        <StatCard label="Critical Findings" value={overview.criticalIssues?.toString()} delta="Unresolved" accent={overview.criticalIssues > 0 ? "warning" : "success"} />
        <StatCard label="Avg Resolution Time" value={overview.avgReviewTime} delta="System speed" accent="violet" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ROW 2 & 5: CHARTS (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* QUALITY TREND */}
          <Panel title="Quality Trend Over Time">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendChart}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.68 0.22 265)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.68 0.22 265)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.3 0.01 280)" />
                  <XAxis dataKey="d" stroke="oklch(0.5 0.01 280)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8, fontSize: 12 }} 
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="oklch(0.68 0.22 265)" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {/* REPOSITORY HEALTH TABLE */}
          <Panel title="Repository Health">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground border-b border-border">
                  <tr>
                    <th className="pb-3 font-medium">Repository</th>
                    <th className="pb-3 font-medium text-center">Score</th>
                    <th className="pb-3 font-medium text-center">Critical</th>
                    <th className="pb-3 font-medium text-right">Last Scan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {repositoryHealth?.map((repo: any, i: number) => (
                    <tr key={i} className="hover:bg-surface/30 transition-colors">
                      <td className="py-3 font-medium text-foreground">{repo.name}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-mono ${repo.score >= 85 ? 'bg-success/15 text-success' : repo.score >= 70 ? 'bg-yellow-500/15 text-yellow-500' : 'bg-destructive/15 text-destructive'}`}>
                          {repo.score}
                        </span>
                      </td>
                      <td className="py-3 text-center text-muted-foreground">{repo.critical}</td>
                      <td className="py-3 text-right text-muted-foreground">{repo.lastScan ? formatDistanceToNow(new Date(repo.lastScan), { addSuffix: true }) : 'Never'}</td>
                    </tr>
                  ))}
                  {(!repositoryHealth || repositoryHealth.length === 0) && (
                    <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">No repositories scanned yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
          
        </div>

        {/* Right 1 column */}
        <div className="space-y-6">
          
          {/* FINDINGS BREAKDOWN */}
          <Panel title="Findings by Category">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={findingsByCategory} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="oklch(0.3 0.01 280)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="category" type="category" stroke="oklch(0.5 0.01 280)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="oklch(0.68 0.22 265)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {/* TOP ISSUES */}
          <Panel title="Top Recurring Issues">
            <div className="space-y-4 mt-2">
              {topIssues?.map((issue: any, index: number) => (
                <div key={index} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-muted-foreground font-mono text-xs w-4">{index + 1}.</span>
                    <span className="text-sm text-foreground/90 truncate group-hover:text-electric transition-colors">{issue.issue}</span>
                  </div>
                  <span className="text-xs font-mono bg-surface px-2 py-1 rounded text-muted-foreground shrink-0">{issue.count}</span>
                </div>
              ))}
              {(!topIssues || topIssues.length === 0) && (
                <p className="text-sm text-muted-foreground">No recurring issues detected.</p>
              )}
            </div>
          </Panel>

          {/* RECENT EVENTS */}
          <Panel title="Recent Engineering Events">
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[9px] before:h-full before:w-px before:bg-border">
              {recentEvents?.map((event: any, i: number) => (
                <div key={i} className="relative flex gap-4 pl-8">
                  <div className="absolute left-0 top-1 h-5 w-5 rounded-full bg-surface border border-border flex items-center justify-center z-10">
                    <div className="h-1.5 w-1.5 rounded-full bg-electric" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground/90 leading-tight">{event.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(event.date), { addSuffix: true })} · {event.reviewTitle}
                    </p>
                  </div>
                </div>
              ))}
              {(!recentEvents || recentEvents.length === 0) && (
                <p className="text-sm text-muted-foreground pl-4">No recent events.</p>
              )}
            </div>
          </Panel>

        </div>
      </div>
    </div>
  );
}
