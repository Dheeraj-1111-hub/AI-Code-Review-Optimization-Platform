import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageBits";
import { motion } from "framer-motion";
import { FolderGit2, Plus, Star, GitBranch, Github } from "lucide-react";

import { useState } from "react";
import { useRepositories } from "@/features/repositories/hooks/useRepositories";
import { ConnectRepoModal } from "@/features/repositories/components/ConnectRepoModal";
import { useAuth } from "@clerk/clerk-react";

export const Route = createFileRoute("/_app/repositories/")({
  component: Repos,
});

function Repos() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: repos = [], isLoading } = useRepositories();
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Repositories"
        sub={`${repos.length} connected · monitored continuously.`}
        action={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-3.5 py-2 text-sm font-medium text-primary-foreground glow"
          >
            <Plus className="h-4 w-4" /> Connect repo
          </button>
        }
      />
      
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="gradient-border p-5 h-32 animate-pulse bg-surface-elevated/50" />
          ))}
        </div>
      ) : repos.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <FolderGit2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No repositories connected</h3>
          <p className="text-muted-foreground mt-2 mb-6">Connect your GitHub account to start analyzing code.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Github className="h-4 w-4" /> Connect GitHub
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map((r: any, i: number) => (
            <div 
              key={r._id} 
              onClick={() => navigate({ to: '/repositories/$repoId', params: { repoId: r._id.toString() } })}
              role="button"
              tabIndex={0}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                className="gradient-border p-5 h-full cursor-pointer hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="h-4 w-4 text-electric" />
                    <h3 className="font-semibold">{r.name}</h3>
                  </div>
                  <Star className="h-4 w-4 text-muted-foreground hover:text-warning" />
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground line-clamp-1">{r.fullName}</p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">{r.language || 'Unknown'}</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <GitBranch className="h-3 w-3" /> {r.defaultBranch}
                  </span>
                </div>
                <div className="mt-3 relative group/health">
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="text-muted-foreground">Health</span>
                    <span className={!r.lastScannedAt ? "text-muted-foreground" : r.healthScore >= 85 ? "text-success" : r.healthScore >= 70 ? "text-warning" : "text-destructive"}>
                      {r.lastScannedAt ? r.healthScore : '--'}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-surface overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: r.lastScannedAt ? `${r.healthScore}%` : '0%' }} transition={{ duration: 1, delay: i * 0.05 }}
                      className={`h-full ${!r.lastScannedAt ? "bg-muted" : r.healthScore >= 85 ? "bg-success" : r.healthScore >= 70 ? "bg-gradient-primary" : "bg-destructive"}`}
                    />
                  </div>
                  
                  {/* Health Breakdown Tooltip */}
                  {r.metrics && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 rounded-lg bg-surface border border-border shadow-xl opacity-0 invisible group-hover/health:opacity-100 group-hover/health:visible transition-all z-20">
                      <p className="text-xs font-semibold mb-2 border-b border-border/50 pb-1 text-foreground">Health Breakdown</p>
                      <div className="space-y-1.5 text-[10px] font-mono">
                        <div className="flex justify-between"><span className="text-muted-foreground">Security</span> <span className={r.metrics.security > 80 ? "text-success" : "text-warning"}>{r.metrics.security || 0}/100</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Architecture</span> <span className={r.metrics.architecture > 80 ? "text-success" : "text-warning"}>{r.metrics.architecture || 0}/100</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Performance</span> <span className={r.metrics.performance > 80 ? "text-success" : "text-warning"}>{r.metrics.performance || 0}/100</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Maintainability</span> <span className={r.metrics.maintainability > 80 ? "text-success" : "text-warning"}>{r.metrics.maintainability || 0}/100</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      )}

      <ConnectRepoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
