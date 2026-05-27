import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, BrainCircuit, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export type AIStatus = "idle" | "thinking" | "ready" | "error";

interface AIStatusPillProps {
  status: AIStatus;
  message?: string;
  className?: string;
}

export function AIStatusPill({ status, message, className }: AIStatusPillProps) {
  const statusConfig = {
    idle: {
      icon: <BrainCircuit className="h-3 w-3" />,
      text: "AI Ready",
      colorClass: "text-muted-foreground bg-surface border-border",
    },
    thinking: {
      icon: <RefreshCw className="h-3 w-3 animate-spin" />,
      text: "AI Processing...",
      colorClass: "text-primary bg-primary/10 border-primary/20",
    },
    ready: {
      icon: <Sparkles className="h-3 w-3 text-electric" />,
      text: "AI Generated",
      colorClass: "text-foreground bg-surface border-electric/30 shadow-[0_0_10px_rgba(104,34,265,0.15)]",
    },
    error: {
      icon: <BrainCircuit className="h-3 w-3 text-destructive" />,
      text: "AI Unavailable",
      colorClass: "text-destructive bg-destructive/10 border-destructive/20",
    },
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
        config.colorClass,
        status === "thinking" && "animate-pulse",
        className
      )}
    >
      {config.icon}
      <span>{message || config.text}</span>
    </motion.div>
  );
}
