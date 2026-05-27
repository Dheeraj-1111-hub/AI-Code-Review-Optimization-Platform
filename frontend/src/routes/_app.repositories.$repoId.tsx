import { createFileRoute } from "@tanstack/react-router";
import { useRepository, useScanRepository } from "@/features/repositories/hooks/useRepositories";
import { PageHeader } from "@/components/app/PageBits";
import { motion } from "framer-motion";
import { 
  GitBranch, FolderGit2, Star, Github, Activity, 
  ShieldAlert, Zap, BarChart2, CheckCircle2, AlertTriangle, Play 
} from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_app/repositories/$repoId")({
  component: RepositoryDashboard,
});

function MetricCard({ title, score, icon: Icon, delay, isScanned }: { title: string, score: number | null, icon: any, delay: number, isScanned: boolean }) {
  const displayScore = isScanned && score !== null ? score : '--';
  const isHealthy = isScanned && score !== null && score >= 85;
  const isWarning = isScanned && score !== null && score >= 70 && score < 85;
  const isDestructive = isScanned && score !== null && score < 70;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-5 gradient-border bg-surface relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <span className={`text-2xl font-bold font-mono ${isHealthy ? 'text-success' : isWarning ? 'text-warning' : isDestructive ? 'text-destructive' : 'text-muted-foreground'}`}>
          {displayScore}
        </span>
      </div>
      <div className="h-2 rounded-full bg-surface-elevated overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isScanned && score !== null ? `${score}%` : '0%' }}
          transition={{ duration: 1, delay: delay + 0.2 }}
          className={`h-full ${isHealthy ? 'bg-success' : isWarning ? 'bg-gradient-primary' : isDestructive ? 'bg-destructive' : 'bg-muted'}`}
        />
      </div>
      {!isScanned && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider bg-surface px-2 py-1 rounded border border-border">Awaiting Scan</span>
        </div>
      )}
    </motion.div>
  );
}

const loadingStates = [
  { text: "Cloning repository into secure sandbox" },
  { text: "Resolving dependencies and mapping ASTs" },
  { text: "Running architectural integrity checks" },
  { text: "Scanning for security vulnerabilities" },
  { text: "Calculating final repository health score" },
];

function ScanningOverlay() {
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    const timers = loadingStates.map((_, i) => 
      setTimeout(() => setStep(i), i * 1800)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#09090b]/90 backdrop-blur-xl">
      <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center justify-center">
        {/* Core pulsing glow */}
        <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full scale-150 animate-pulse pointer-events-none" />
        
        <div className="relative z-10 w-full space-y-6">
           {loadingStates.map((state, index) => {
             const isPast = index < step;
             const isCurrent = index === step;
             const isFuture = index > step;

             return (
               <motion.div
                 key={index}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ 
                   opacity: isPast ? 0.5 : isCurrent ? 1 : 0.15, 
                   y: isCurrent ? 0 : isPast ? -8 : 8,
                   scale: isCurrent ? 1.05 : 0.98
                 }}
                 transition={{ duration: 0.5, ease: "easeOut" }}
                 className="flex items-center justify-center gap-6"
               >
                 <div className="flex-none w-8 h-8 flex items-center justify-center">
                   {isPast ? (
                     <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                       <CheckCircle2 className="h-7 w-7 text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                     </motion.div>
                   ) : isCurrent ? (
                     <div className="relative flex items-center justify-center w-full h-full">
                       <div className="absolute inset-0 border-2 border-primary/30 rounded-full" />
                       <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                       <div className="h-2 w-2 bg-primary rounded-full animate-ping" />
                     </div>
                   ) : (
                     <div className="h-6 w-6 border-2 border-zinc-700/50 rounded-full" />
                   )}
                 </div>
                 <div className={`text-xl font-medium tracking-tight whitespace-nowrap ${
                   isCurrent ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 
                   isPast ? 'text-zinc-400' : 'text-zinc-600'
                 }`}>
                   {state.text}
                 </div>
               </motion.div>
             )
           })}
        </div>
      </div>
    </div>
  );
}

function RepositoryDashboard() {
  const { repoId } = Route.useParams();
  const { data: repo, isLoading } = useRepository(repoId);
  const scanRepo = useScanRepository();

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-20 bg-surface-elevated animate-pulse rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-surface-elevated animate-pulse rounded-xl" />)}
        </div>
        <div className="h-96 bg-surface-elevated animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!repo) {
    return <div className="p-6 text-center text-muted-foreground">Repository not found</div>;
  }

  const { metrics, stats, latestReviewId: latestReview } = repo;
  
  // Extract findings from latest review
  const findings = latestReview?.findings || [];
  
  // Aggregate hotspots by file
  const hotspots: Record<string, number> = {};
  findings.forEach((f: any) => {
    if (f.file) {
      hotspots[f.file] = (hotspots[f.file] || 0) + 1;
    }
  });
  
  const sortedHotspots = Object.entries(hotspots).sort((a, b) => b[1] - a[1]).slice(0, 5);
  
  // Separate vulnerabilities
  const vulnerabilities = findings.filter((f: any) => f.type === 'vulnerability');

  const isScanned = !!repo.lastScannedAt;
  const isScanning = scanRepo.isPending || latestReview?.status === 'analyzing';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {isScanning && <ScanningOverlay />}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-surface p-6 rounded-2xl border border-border">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Github className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">{repo.fullName}</h1>
            {repo.isPrivate && (
              <span className="px-2 py-1 text-xs font-medium border border-border rounded-full text-muted-foreground">
                Private
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm max-w-2xl">
            {repo.description || "No description provided."}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground font-mono">
            <span className="flex items-center gap-1.5"><GitBranch className="h-4 w-4" /> {repo.defaultBranch}</span>
            <span className="flex items-center gap-1.5"><FolderGit2 className="h-4 w-4" /> {repo.language}</span>
            <span className="flex items-center gap-1.5"><Star className="h-4 w-4" /> {repo.stars}</span>
            <span className="flex items-center gap-1.5"><Activity className="h-4 w-4" /> {stats?.pullRequests || 0} PRs</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Overall Health</p>
            <div className="text-4xl font-black font-mono bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50">
              {isScanned ? repo.healthScore : '--'}
            </div>
          </div>
          <button 
            onClick={() => scanRepo.mutate(repo._id)}
            disabled={scanRepo.isPending}
            className="flex items-center gap-2 bg-gradient-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-all"
          >
            {scanRepo.isPending ? <Activity className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
            Scan Now
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Security" score={metrics?.security} icon={ShieldAlert} delay={0.1} isScanned={isScanned} />
        <MetricCard title="Performance" score={metrics?.performance} icon={Zap} delay={0.2} isScanned={isScanned} />
        <MetricCard title="Architecture" score={metrics?.architecture} icon={FolderGit2} delay={0.3} isScanned={isScanned} />
        <MetricCard title="Maintainability" score={metrics?.maintainability} icon={CheckCircle2} delay={0.4} isScanned={isScanned} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 gradient-border p-6 bg-surface">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-electric" />
              Recent Intelligence Activity
            </h3>
          </div>
          
          <div className="space-y-4">
            {repo.recentReviews?.length > 0 ? repo.recentReviews.map((review: any, i: number) => (
              <motion.div 
                key={review._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-surface-elevated transition-colors"
              >
                <div>
                  <p className="font-medium text-sm mb-1">{review.title}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {new Date(review.createdAt).toLocaleDateString()} · PR #{review.prNumber || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    review.status === 'approved' ? 'border-success text-success bg-success/10' :
                    review.status === 'blocked' ? 'border-destructive text-destructive bg-destructive/10' :
                    review.status === 'analyzing' ? 'border-primary text-primary bg-primary/10 animate-pulse' :
                    'border-border text-muted-foreground'
                  }`}>
                    {review.status}
                  </span>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</p>
                    <p className="font-mono font-bold text-sm">{review.scores?.overallScore || '--'}</p>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-10 text-muted-foreground">
                <p>No reviews have been run yet.</p>
                <p className="text-sm mt-1">Open a PR or trigger a manual scan to generate intelligence.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="gradient-border p-6 bg-surface flex flex-col max-h-[400px]">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-warning" />
              File Hotspots
            </h3>
            {sortedHotspots.length > 0 ? (
              <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2">
                {sortedHotspots.map(([file, count]: [string, number]) => (
                  <div key={file} className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-background">
                    <p className="text-sm font-medium font-mono truncate mr-2" title={file}>{file}</p>
                    <span className="shrink-0 text-xs font-bold px-2 py-1 bg-destructive/10 text-destructive rounded-full">
                      {count} issues
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-muted-foreground border border-dashed border-border rounded-xl p-6">
                <div>
                  <FolderGit2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Scan required to detect hotspots.</p>
                </div>
              </div>
            )}
          </div>

          <div className="gradient-border p-6 bg-surface flex flex-col max-h-[300px]">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Dependency Risks
            </h3>
            {vulnerabilities.length > 0 ? (
              <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2">
                {vulnerabilities.map((v: any, i: number) => (
                  <div key={i} className="flex flex-col p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                    <p className="text-sm font-medium truncate">{v.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-success border border-dashed border-success/30 rounded-xl p-6 bg-success/5">
                <div>
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">0 vulnerabilities detected.</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="gradient-border p-6 bg-surface flex-1">
             <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-primary" />
              AI Memory
            </h3>
            {findings.length > 0 ? (
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "Analyzed {latestReview?.filesScanned || 0} files. Found {findings.length} potential issues affecting architecture and security. Continuous monitoring active."
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "No recurring patterns detected yet. I am monitoring this repository for architectural drift and security anti-patterns."
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
