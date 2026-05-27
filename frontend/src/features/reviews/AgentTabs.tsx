import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Layers, RefreshCw, Sparkles, Check, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditorStore } from '../review/store/editor.store';

export interface AgentIssue {
  line?: number;
  severity: 'high' | 'medium' | 'low';
  message: string;
  suggestion?: string;
}

export interface AgentResult {
  agent_name: string;
  score: number;
  summary: string;
  issues: AgentIssue[];
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
  'Security': <Shield className="h-4 w-4" />,
  'Performance': <Zap className="h-4 w-4" />,
  'Architecture': <Layers className="h-4 w-4" />,
  'Refactoring': <RefreshCw className="h-4 w-4" />,
  'Clean Code': <Sparkles className="h-4 w-4" />
};

export function AgentTabs({ results }: { results: AgentResult[] }) {
  const [activeTab, setActiveTab] = useState<string>(results[0]?.agent_name || 'Security');

  if (!results || results.length === 0) return null;

  const { files, activeFileId, setDiffMode } = useEditorStore();
  const activeFile = files.find(f => f.id === activeFileId);
  const activeResult = results.find(r => r.agent_name === activeTab) || results[0];

  const handleApplyFix = (issue: AgentIssue) => {
    if (!activeFile || !issue.line || !issue.suggestion) return;
    
    // Very basic line-based patch simulation for the demo.
    // In production, a dedicated backend Patch Service handles AST replacement.
    const lines = activeFile.content.split('\n');
    if (issue.line > 0 && issue.line <= lines.length) {
      // Preserve leading whitespace
      const match = lines[issue.line - 1].match(/^\s*/);
      const padding = match ? match[0] : '';
      
      // If the suggestion has multiple lines, pad them correctly
      const suggestionLines = issue.suggestion.split('\n').map((l, i) => i === 0 ? l : padding + l);
      
      // Replace the line
      lines[issue.line - 1] = padding + suggestionLines.join('\n');
    }
    
    setDiffMode(true, lines.join('\n'));
  };

  return (
    <div className="w-full bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Tabs Header */}
      <div className="flex flex-wrap items-center bg-surface-hover/50 border-b border-border">
        {results.map((result) => (
          <button
            key={result.agent_name}
            onClick={() => setActiveTab(result.agent_name)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative outline-none",
              activeTab === result.agent_name 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-surface"
            )}
          >
            {AGENT_ICONS[result.agent_name] || <Check className="h-4 w-4" />}
            {result.agent_name}
            {activeTab === result.agent_name && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                initial={false}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6 flex-1 bg-surface">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  {AGENT_ICONS[activeTab]} {activeTab} Analysis
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeResult.summary}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold font-heading">
                  <span className={cn(
                    activeResult.score >= 90 ? "text-emerald-500" :
                    activeResult.score >= 70 ? "text-amber-500" : "text-red-500"
                  )}>
                    {activeResult.score}
                  </span>
                  <span className="text-muted-foreground text-lg">/100</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              {activeResult.issues.length === 0 ? (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  No issues found. Excellent work!
                </div>
              ) : (
                activeResult.issues.map((issue, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-border bg-surface-hover/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium uppercase tracking-wider",
                            issue.severity === 'high' ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                            issue.severity === 'medium' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                            "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                          )}>
                            {issue.severity}
                          </span>
                          {issue.line && (
                            <span className="text-xs text-muted-foreground font-mono">
                              Line {issue.line}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground mb-2 font-medium">{issue.message}</p>
                        {issue.suggestion && (
                          <div className="text-sm text-muted-foreground bg-black/20 p-3 rounded-md border border-border/50 font-mono mt-3">
                            <span className="text-primary/70 mr-2">💡</span>
                            {issue.suggestion}
                          </div>
                        )}
                      </div>
                      
                      {issue.suggestion && activeTab === 'Refactoring' && (
                        <button
                          onClick={() => handleApplyFix(issue)}
                          className="mt-2 shrink-0 flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                          <Wand2 className="h-3.5 w-3.5" />
                          Apply Fix
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Needed for the empty state
function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
