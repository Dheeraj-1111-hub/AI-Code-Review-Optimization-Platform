import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/app/PageBits";
import { GitPullRequest, Filter, Search, Loader2 } from "lucide-react";
import { useReviews } from "../features/reviews/hooks/useReviews";
import { useReviewsStore } from "../features/reviews/store/reviews.store";
import { useReviewSocket } from "../features/reviews/hooks/useReviewSocket";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_app/reviews/")({
  component: Reviews,
});

function Reviews() {
  useReviewSocket();
  const { filters, setFilter } = useReviewsStore();
  const { data, isLoading } = useReviews(filters);
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Reviews"
        sub="Every code review handled by your AI engineering team."
        action={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search reviews..."
                className="h-8 w-[200px] rounded-md border border-border bg-surface/50 pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={filters.search || ''}
                onChange={(e) => setFilter('search', e.target.value)}
              />
            </div>
            <select
              className="h-8 rounded-md border border-border bg-surface/50 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={filters.status || ''}
              onChange={(e) => setFilter('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="analyzing">Analyzing</option>
              <option value="completed">Completed</option>
              <option value="approved">Approved</option>
              <option value="changes_requested">Changes Requested</option>
              <option value="blocked">Blocked</option>
              <option value="merged">Merged</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        }
      />
      
      <Panel title={data ? `${data.pagination.total} reviews found` : "Loading reviews..."}>
        {isLoading ? (
          <div className="flex justify-center p-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !data?.reviews?.length ? (
          <div className="p-8 text-center text-muted-foreground">
            No reviews found matching your criteria.
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {data.reviews.map((r: any) => (
              <li key={r._id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div className="h-9 w-9 rounded-lg bg-surface flex items-center justify-center">
                  <GitPullRequest className="h-4 w-4 text-electric" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/reviews/${r._id}` as any} className="text-sm font-medium hover:text-electric block truncate">
                    {r.repositoryId?.name || r.title?.replace('Review-', 'Repo-') || 'Unnamed Review'} • {r.branch || 'main'} • {r.commitHash ? r.commitHash.substring(0, 7) : r._id.substring(r._id.length - 7)}
                  </Link>
                  <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                    {r.language ? `${r.language} analysis` : 'Analysis'}
                  </p>
                </div>
                <span className="hidden sm:inline text-xs text-muted-foreground whitespace-nowrap w-24 text-right">
                  {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                </span>
                <div className="relative group flex items-center justify-end w-16">
                  <span className="font-mono text-sm tabular-nums w-12 text-right cursor-help">
                    {r.scores?.overallScore || 0}
                  </span>
                  
                  {/* Score Breakdown Tooltip */}
                  <div className="absolute right-0 top-6 w-48 p-3 rounded-lg bg-surface border border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <p className="text-xs font-semibold mb-2 border-b border-border/50 pb-1 text-foreground">Score Breakdown</p>
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between"><span className="text-muted-foreground">Security</span> <span className={r.scores?.securityScore > 80 ? "text-success" : "text-warning"}>{r.scores?.securityScore || 0}/100</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Architecture</span> <span className={r.scores?.architectureScore > 80 ? "text-success" : "text-warning"}>{r.scores?.architectureScore || 0}/100</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Performance</span> <span className={r.scores?.performanceScore > 80 ? "text-success" : "text-warning"}>{r.scores?.performanceScore || 0}/100</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Maintainability</span> <span className={r.scores?.maintainabilityScore > 80 ? "text-success" : "text-warning"}>{r.scores?.maintainabilityScore || 0}/100</span></div>
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase w-28 text-center truncate ${
                  r.status === "approved" ? "bg-success/15 text-success" :
                  r.status === "failed" ? "bg-destructive/15 text-destructive" :
                  r.status === "running" || r.status === "analyzing" ? "bg-blue-500/15 text-blue-500" :
                  "bg-warning/15 text-warning"
                }`}>{r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
