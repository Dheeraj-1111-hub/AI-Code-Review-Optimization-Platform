import { motion } from "framer-motion";
import { Zap, Shield, Network, Sparkles, Code2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { HoverEffect } from "@/components/ui/hover-effect";

const AGENT_ICONS: Record<string, any> = {
  performance: { icon: Zap, iconColor: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20", spec: "Runtime · Complexity · Memory" },
  security: { icon: Shield, iconColor: "text-rose-400", bgColor: "bg-rose-500/10", borderColor: "border-rose-500/20", spec: "CVE · Auth · Injection" },
  architecture: { icon: Network, iconColor: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20", spec: "Patterns · Scalability · Boundaries" },
  refactor: { icon: Code2, iconColor: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/20", spec: "Modularization · Abstractions" },
  'clean-code': { icon: Sparkles, iconColor: "text-purple-400", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/20", spec: "Style · Naming · Readability" },
};

export function AgentsGrid({ agents }: { agents?: any[] }) {
  const navigate = useNavigate();
  
  if (!agents || agents.length === 0) return null;

  return (
    <div className="-mx-2">
      <HoverEffect
        items={agents}
        className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
        renderItem={(a: any, i: number) => {
          const agentId = a.id;
          const config = AGENT_ICONS[agentId] || AGENT_ICONS['security'];
          const Icon = config.icon;

          return (
            <motion.div
              role="button"
              tabIndex={0}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#09090b] border border-[#1f1f23] rounded-[16px] p-6 cursor-pointer hover:border-[#2f2f35] transition duration-200 h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-xl border ${config.bgColor} ${config.borderColor}`}>
                  <Icon className={`h-5 w-5 ${config.iconColor}`} />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> active
                </span>
              </div>

              <h3 className="text-lg font-medium text-zinc-100">{a.name}</h3>
              <p className="mt-1 text-sm text-zinc-500">{config.spec}</p>
            </motion.div>
          );
        }}
      />
    </div>
  );
}
