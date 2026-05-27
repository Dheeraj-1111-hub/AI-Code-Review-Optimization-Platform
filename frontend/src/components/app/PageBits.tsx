import { motion } from "framer-motion";
import { ReactNode } from "react";

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold tracking-tight"
        >
          {title}
        </motion.h1>
        {sub && <p className="mt-1.5 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label, value, delta
}: { label: string; value: string; delta?: string; accent?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-[#09090b] border border-[#1f1f23] rounded-[16px] p-5 hover:border-[#2f2f35] transition duration-200"
    >
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-light text-zinc-100">{value}</p>
      {delta && <p className="mt-1 text-xs text-zinc-400">{delta}</p>}
    </motion.div>
  );
}

export function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="bg-[#09090b] border border-[#1f1f23] rounded-[16px] p-5 hover:border-[#2f2f35] transition duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-100">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
