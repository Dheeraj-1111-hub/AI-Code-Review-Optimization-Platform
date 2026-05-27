import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

const PIPELINE_STAGES = [
  { key: 'static', label: 'Static Analysis', icon: '⬡' },
  { key: 'security', label: 'Security Agent', icon: '⬡' },
  { key: 'performance', label: 'Performance Agent', icon: '⬡' },
  { key: 'architecture', label: 'Architecture Agent', icon: '⬡' },
  { key: 'refactoring', label: 'Refactoring Agent', icon: '⬡' },
  { key: 'aggregate', label: 'Aggregating Results', icon: '⬡' },
];

function getPipelineStage(messages: string[]): number {
  const last = messages.join(' ').toLowerCase();
  if (last.includes('aggregat')) return 5;
  if (last.includes('refactor') || last.includes('clean')) return 4;
  if (last.includes('architect')) return 3;
  if (last.includes('performance')) return 2;
  if (last.includes('security') || last.includes('bandit')) return 1;
  if (last.includes('static') || last.includes('radon') || last.includes('initializ')) return 0;
  return -1;
}

export function ReviewStreamPanel({ 
  status, 
  messages 
}: { 
  status: 'idle' | 'analyzing' | 'completed' | 'failed',
  messages: string[] 
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeStage = getPipelineStage(messages);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Pipeline Stage Progress */}
      {(status === 'analyzing' || status === 'completed') && (
        <div className="bg-background/50 border border-border rounded-xl p-4 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Pipeline Stages</p>
          {PIPELINE_STAGES.map((stage, idx) => {
            const isDone = status === 'completed' || idx < activeStage;
            const isActive = idx === activeStage && status === 'analyzing';
            return (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                  isActive && "bg-primary/10 text-primary",
                  isDone && "text-emerald-500",
                  !isActive && !isDone && "text-muted-foreground/50"
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                ) : isActive ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                ) : (
                  <span className="h-3.5 w-3.5 shrink-0 flex items-center justify-center text-[10px]">○</span>
                )}
                {stage.label}
                {isActive && (
                  <span className="ml-auto text-[10px] text-primary/60 font-mono animate-pulse">running...</span>
                )}
                {isDone && (
                  <span className="ml-auto text-[10px] text-emerald-500/60 font-mono">done</span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Terminal Log */}
      <div className="flex-1 flex flex-col bg-[#0d0d0f] border border-border rounded-xl overflow-hidden min-h-[180px]">
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-white/[0.02] flex-shrink-0">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Terminal className="h-3 w-3 text-muted-foreground/40" />
            <span className="text-[10px] font-mono text-muted-foreground/40 tracking-widest uppercase">devlens pipeline</span>
          </div>
          <div className="ml-auto">
            {status === 'analyzing' && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />}
            {status === 'completed' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />}
          </div>
        </div>

        {/* Log output */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-1.5 font-mono text-xs"
        >
          {messages.length === 0 ? (
            <div className="text-muted-foreground/30 italic">
              <span className="text-primary/40">$ </span>
              awaiting review command...
              <span className="ml-1 animate-pulse">_</span>
            </div>
          ) : (
            messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex items-start gap-2",
                  msg.startsWith('✓') ? "text-emerald-400" :
                  msg.startsWith('✗') ? "text-red-400" :
                  i === messages.length - 1 && status === 'analyzing' ? "text-amber-300" :
                  "text-muted-foreground/70"
                )}
              >
                <span className="text-primary/30 shrink-0 select-none">
                  {msg.startsWith('✓') ? '✓' : msg.startsWith('✗') ? '✗' : '>'}
                </span>
                <span className={cn(
                  i === messages.length - 1 && status === 'analyzing' && "animate-pulse"
                )}>
                  {msg.startsWith('✓') || msg.startsWith('✗') ? msg.slice(2) : msg}
                </span>
              </motion.div>
            ))
          )}

          {status === 'analyzing' && messages.length > 0 && (
            <div className="flex items-center gap-2 text-primary/50">
              <span>{'>'}</span>
              <span className="animate-pulse">_</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
