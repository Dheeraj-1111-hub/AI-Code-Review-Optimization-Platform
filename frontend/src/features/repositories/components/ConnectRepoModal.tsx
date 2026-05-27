import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Github, Loader2, Link as LinkIcon, Search, AlertCircle } from "lucide-react";
import { useConnectRepository } from "../hooks/useRepositories";

interface ConnectRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectRepoModal({ isOpen, onClose }: ConnectRepoModalProps) {
  const [step, setStep] = useState<"username" | "repos">("username");
  const [username, setUsername] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [realRepos, setRealRepos] = useState<any[]>([]);
  const [error, setError] = useState("");
  const connectRepo = useConnectRepository();

  const handleFetchRepos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setIsFetching(true);
    setError("");
    
    try {
      const response = await fetch(`https://api.github.com/users/${username.trim()}/repos?sort=updated&per_page=15`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("GitHub user or organization not found.");
        throw new Error("Failed to fetch repositories.");
      }
      
      const data = await response.json();
      if (data.length === 0) throw new Error("No public repositories found.");
      
      setRealRepos(data);
      setStep("repos");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSelectRepo = (repo: any) => {
    connectRepo.mutate(
      {
        name: repo.name,
        owner: repo.owner.login,
        provider: "github",
        language: repo.language || "Unknown",
        isPrivate: repo.private,
      },
      {
        onSuccess: () => {
          onClose();
          // Reset state for next open
          setTimeout(() => {
            setStep("username");
            setUsername("");
            setRealRepos([]);
          }, 300);
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-surface border border-border rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h2 className="text-lg font-semibold">Connect GitHub Repository</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-elevated rounded-md transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === "username" ? (
              <motion.div
                key="username"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground mb-4">
                  Enter a GitHub username or organization to import public repositories for AI Code Review.
                </p>

                <form onSubmit={handleFetchRepos} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="e.g. facebook, vercel, octocat"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isFetching || !username.trim()}
                    className="w-full flex items-center justify-center gap-2 p-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isFetching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Github className="h-4 w-4" />
                        <span className="font-medium">Fetch Repositories</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="repos"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <img src={realRepos[0]?.owner?.avatar_url} alt="avatar" className="w-6 h-6 rounded-full border border-border" />
                    <p className="text-sm font-medium">{realRepos[0]?.owner?.login}'s Repositories</p>
                  </div>
                  <button 
                    onClick={() => setStep("username")}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Change User
                  </button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {realRepos.map((repo) => (
                    <div
                      key={repo.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary/50 group transition-colors bg-background"
                    >
                      <div className="overflow-hidden">
                        <p className="font-medium text-sm flex items-center gap-2 truncate">
                          {repo.name}
                          {repo.private && (
                            <span className="shrink-0 text-[10px] px-1.5 py-0.5 border border-border rounded text-muted-foreground">
                              Private
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2 truncate">
                          {repo.language && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary/50"></span>{repo.language}</span>}
                          {repo.stargazers_count > 0 && <span>★ {repo.stargazers_count}</span>}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSelectRepo(repo)}
                        disabled={connectRepo.isPending}
                        className="shrink-0 ml-2 p-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 rounded-md disabled:opacity-50"
                        title="Connect Repository"
                      >
                        {connectRepo.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LinkIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
