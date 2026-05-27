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

export function ScoreVisualizer({ scores }: ScoreVisualizerProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'from-emerald-500 to-emerald-400';
    if (score >= 70) return 'from-amber-500 to-amber-400';
    return 'from-red-500 to-red-400';
  };

  const metrics = [
    { label: 'Security', score: scores.securityScore, icon: Shield },
    { label: 'Performance', score: scores.performanceScore, icon: Zap },
    { label: 'Architecture', score: scores.architectureScore, icon: Layers },
    { label: 'Maintainability', score: scores.maintainabilityScore, icon: Activity },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Overall Score (Hero) */}
      <div className="lg:col-span-1 flex flex-col items-center justify-center p-6 bg-surface border border-border rounded-xl shadow-sm relative overflow-hidden">
        <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-br", getScoreGradient(scores.overallScore))} />
        <h4 className="text-sm font-medium text-muted-foreground mb-4 z-10 uppercase tracking-wider">Overall</h4>
        <div className="relative z-10 flex items-center justify-center">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle cx="48" cy="48" r="36" className="stroke-muted fill-none stroke-[8]" />
            <motion.circle
              cx="48" cy="48" r="36"
              className={cn("fill-none stroke-[8]", getScoreColor(scores.overallScore).split(' ')[0])}
              strokeDasharray="226.2"
              initial={{ strokeDashoffset: 226.2 }}
              animate={{ strokeDashoffset: 226.2 - (226.2 * scores.overallScore) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold font-heading text-foreground">{scores.overallScore}</span>
          </div>
        </div>
      </div>

      {/* Individual Metrics */}
      <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            className={cn(
              "flex flex-col items-center justify-center p-6 rounded-xl border shadow-sm transition-all hover:scale-105",
              getScoreColor(metric.score)
            )}
          >
            <metric.icon className="h-6 w-6 mb-3 opacity-80" />
            <div className="text-3xl font-bold font-heading mb-1">{metric.score}</div>
            <div className="text-xs font-medium uppercase tracking-wider opacity-80">{metric.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
