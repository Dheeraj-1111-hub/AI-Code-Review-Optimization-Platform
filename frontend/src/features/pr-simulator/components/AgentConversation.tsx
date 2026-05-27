import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, AlertCircle } from 'lucide-react';

interface Review {
  agent: string;
  verdict: string;
  summary: string;
  findings: any[];
  model_used?: string;
}

interface AgentConversationProps {
  activeAgent: string;
  reviews: Review[];
  isSimulating: boolean;
  agents: { id: string, name: string }[];
}

export function AgentConversation({ activeAgent, reviews, isSimulating, agents }: AgentConversationProps) {
  const activeName = agents.find(a => a.id === activeAgent)?.name || activeAgent;
  const review = reviews.find(r => r.agent === activeName);

  return (
    <motion.div
      key={activeAgent}
      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
      className="gradient-border p-4 flex flex-col h-[500px]"
    >
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="h-4 w-4 text-electric" />
        <h3 className="text-sm font-semibold">Agent Conversation</h3>
        {isSimulating && <span className="ml-auto text-[10px] font-mono text-success animate-pulse">live</span>}
      </div>
      
      <ul className="space-y-3 flex-1 overflow-y-auto pr-2">
        {review ? (
          <>
            <motion.li
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border/60 bg-surface/60 p-3"
            >
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-electric">{review.agent}</span>
                {review.model_used && (
                  <span className="text-[9px] font-mono opacity-50 px-1 border border-border/50 rounded">
                    {review.model_used}
                  </span>
                )}
                <span
                  className={`ml-auto text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                    review.verdict === "BLOCK" ? "bg-destructive/15 text-destructive" :
                    review.verdict === "APPROVE" ? "bg-success/15 text-success" :
                    review.verdict === "REQUEST_CHANGES" ? "bg-warning/15 text-warning" :
                    "bg-muted text-muted-foreground"
                  }`}
                >
                  {review.verdict}
                </span>
              </div>
              <p className="mt-2 text-sm leading-snug">{review.summary}</p>
            </motion.li>

            {review.findings.map((f, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i + 1) * 0.1 }}
                className="rounded-lg border border-border/60 bg-surface/30 p-3"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-[10px] text-muted-foreground">{f.file}:{f.line}</span>
                  <span className={`text-[10px] uppercase font-mono px-1 rounded ${
                    f.severity === 'critical' ? 'bg-destructive text-destructive-foreground' :
                    f.severity === 'high' ? 'text-destructive' :
                    f.severity === 'medium' ? 'text-warning' : 'text-muted-foreground'
                  }`}>{f.severity}</span>
                </div>
                <p className="text-sm">{f.comment}</p>
                {f.suggestion && (
                  <div className="mt-2 p-2 bg-black/40 rounded border border-border/50 text-xs font-mono text-muted-foreground">
                    {f.suggestion}
                  </div>
                )}
              </motion.li>
            ))}
          </>
        ) : isSimulating ? (
          <li className="rounded-lg border border-electric/30 bg-electric/5 p-3 flex items-center gap-2 text-xs text-electric">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="caret">{activeName} is reviewing the diff...</span>
          </li>
        ) : (
          <li className="text-sm text-muted-foreground italic p-4 text-center">
            No review provided by this agent.
          </li>
        )}
      </ul>
      
      {review && review.verdict === "BLOCK" && (
        <div className="mt-3 pt-3 border-t border-border/60 flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          Blocking issues found by {activeName}.
        </div>
      )}
    </motion.div>
  );
}
