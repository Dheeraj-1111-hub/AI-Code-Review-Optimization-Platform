import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Shield, Zap, Layers, Activity } from 'lucide-react';

interface ScoreVisualizerProps {
  scores: {
    securityScore: number;
    performanceScore: number;
    maintainabilityScore: number;
    architectureScore: number;
    overallScore: number;
  };
}

function getScoreColor(score: number) {
  if (score >= 90) return { text: 'text-emerald-400', bar: 'bg-emerald-400', glow: 'shadow-emerald-500/30', ring: 'stroke-emerald-400' };
  if (score >= 70) return { text: 'text-amber-400', bar: 'bg-amber-400', glow: 'shadow-amber-500/30', ring: 'stroke-amber-400' };
  return { text: 'text-red-400', bar: 'bg-red-400', glow: 'shadow-red-500/30', ring: 'stroke-red-400' };
}

function getLabel(score: number) {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
}

const metrics = [
  { label: 'Security', key: 'securityScore' as const, icon: Shield },
  { label: 'Performance', key: 'performanceScore' as const, icon: Zap },
  { label: 'Architecture', key: 'architectureScore' as const, icon: Layers },
  { label: 'Maintainability', key: 'maintainabilityScore' as const, icon: Activity },
];

export function ScoreVisualizer({ scores }: ScoreVisualizerProps) {
  const overall = scores.overallScore;
  const colors = getScoreColor(overall);
  const circumference = 2 * Math.PI * 40;

  return (
    <div className="space-y-4">
      {/* Overall Score Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-surface to-background p-5 flex items-center gap-6"
      >
        {/* Background glow */}
        <div className={cn("absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl opacity-20", 
          overall >= 90 ? 'bg-emerald-500' : overall >= 70 ? 'bg-amber-500' : 'bg-red-500'
        )} />

        {/* Ring */}
        <div className="relative shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
            <motion.circle
              cx="50" cy="50" r="40" fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - (circumference * overall) / 100 }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
              className={colors.ring}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={cn("text-2xl font-bold leading-none", colors.text)}
            >
              {overall}
            </motion.span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-1">Overall Health</p>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-4xl font-bold font-heading", colors.text)}>{overall}</span>
            <span className="text-muted-foreground text-sm">/100</span>
          </div>
          <div className={cn("inline-flex items-center gap-1 mt-1 text-xs font-semibold px-2 py-0.5 rounded-full",
            overall >= 90 ? 'bg-emerald-500/10 text-emerald-400' :
            overall >= 70 ? 'bg-amber-500/10 text-amber-400' :
            'bg-red-500/10 text-red-400'
          )}>
            {getLabel(overall)}
          </div>
        </div>
      </motion.div>

      {/* Metric Bars */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map(({ label, key, icon: Icon }, idx) => {
          const score = scores[key];
          const c = getScoreColor(score);
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.08, duration: 0.4 }}
              className="bg-background border border-border rounded-xl p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("p-1.5 rounded-lg",
                    score >= 90 ? 'bg-emerald-500/10' : score >= 70 ? 'bg-amber-500/10' : 'bg-red-500/10'
                  )}>
                    <Icon className={cn("h-3.5 w-3.5", c.text)} />
                  </div>
                  <span className="text-xs font-semibold text-foreground">{label}</span>
                </div>
                <span className={cn("text-sm font-bold font-mono", c.text)}>{score}</span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", c.bar)}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 + idx * 0.08 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
