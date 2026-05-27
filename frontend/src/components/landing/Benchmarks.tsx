import { motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const perf = [
  { d: "W1", before: 42, after: 48 },
  { d: "W2", before: 45, after: 58 },
  { d: "W3", before: 50, after: 71 },
  { d: "W4", before: 52, after: 82 },
  { d: "W5", before: 55, after: 91 },
];
const sec = [
  { d: "Mon", v: 12 },
  { d: "Tue", v: 8 },
  { d: "Wed", v: 5 },
  { d: "Thu", v: 6 },
  { d: "Fri", v: 2 },
  { d: "Sat", v: 1 },
];

export function Benchmarks() {
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="gradient-border p-6"
      >
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs font-mono uppercase text-muted-foreground tracking-widest">Performance score</p>
            <p className="mt-2 text-3xl font-bold">+82%</p>
            <p className="text-xs text-success mt-0.5">↑ 30 pts vs baseline</p>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">last 5 sprints</span>
        </div>
        <div className="h-44 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={perf}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.68 0.22 265)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.68 0.22 265)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.65 0.27 295)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.65 0.27 295)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" stroke="oklch(0.5 0.01 280)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Area type="monotone" dataKey="before" stroke="oklch(0.5 0.01 280)" strokeWidth={1.5} fill="url(#g1)" />
              <Area type="monotone" dataKey="after" stroke="oklch(0.68 0.22 265)" strokeWidth={2} fill="url(#g2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="gradient-border p-6"
      >
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs font-mono uppercase text-muted-foreground tracking-widest">Vulnerabilities</p>
            <p className="mt-2 text-3xl font-bold">−92%</p>
            <p className="text-xs text-success mt-0.5">11 → 1 this week</p>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">daily</span>
        </div>
        <div className="h-44 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sec}>
              <XAxis dataKey="d" stroke="oklch(0.5 0.01 280)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Bar dataKey="v" radius={[6, 6, 0, 0]} fill="oklch(0.65 0.27 295)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
