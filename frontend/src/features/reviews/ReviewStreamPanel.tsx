import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreamStatus {
  type: 'status' | 'error' | 'complete';
  message?: string;
  result?: any;
}

export function ReviewStreamPanel({ 
  status, 
  messages 
}: { 
  status: 'idle' | 'analyzing' | 'completed' | 'failed',
  messages: string[] 
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 font-mono text-sm shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-50" />
      
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
        <div className={cn(
          "h-2 w-2 rounded-full animate-pulse",
          status === 'analyzing' ? 'bg-indigo-500' :
          status === 'completed' ? 'bg-emerald-500' :
          status === 'failed' ? 'bg-red-500' : 'bg-muted'
        )} />
        <h3 className="font-semibold text-foreground tracking-tight flex items-center gap-2">
          AI Engineering Pipeline
          {status === 'analyzing' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />}
          {status === 'completed' && <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-2" />}
          {status === 'failed' && <AlertCircle className="h-4 w-4 text-red-500 ml-2" />}
        </h3>
      </div>

      <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-3"
          >
            <span className="text-muted-foreground shrink-0 select-none">
              {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-primary/70 shrink-0 select-none">❯</span>
            <span className={cn(
              "text-muted-foreground",
              i === messages.length - 1 && status === 'analyzing' && "text-foreground font-medium animate-pulse"
            )}>
              {msg}
            </span>
          </motion.div>
        ))}

        {messages.length === 0 && status === 'idle' && (
          <div className="text-muted-foreground italic opacity-50">
            Awaiting input to begin analysis sequence...
          </div>
        )}
      </div>
    </div>
  );
}
