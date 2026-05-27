import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const lines = [
  { t: 'export async function ', c: 'text-violet-glow' },
  { t: 'fetchUserData', c: 'text-electric' },
  { t: '(id: string) {', c: 'text-foreground/80' },
  { t: '  const cache = new Map();', c: 'text-muted-foreground' },
  { t: '  for (let i = 0; i < users.length; i++) {', c: 'text-foreground/80' },
  { t: '    for (let j = 0; j < users.length; j++) {', c: 'text-foreground/80' },
  { t: '      if (users[i].id === id) return users[i];', c: 'text-foreground/80' },
  { t: '    }', c: 'text-foreground/60' },
  { t: '  }', c: 'text-foreground/60' },
  { t: '}', c: 'text-foreground/80' },
];

const insights = [
  { line: 5, type: "perf", text: "O(n²) loop — refactor to Map lookup", color: "warning" },
  { line: 3, type: "arch", text: "Cache never invalidated", color: "electric" },
  { line: 1, type: "sec", text: "Validate `id` against injection", color: "destructive" },
];

export function HeroCodeReview() {
  const [shown, setShown] = useState(0);
  const [insightIdx, setInsightIdx] = useState(-1);

  useEffect(() => {
    const t = setInterval(() => {
      setShown((s) => (s < lines.length ? s + 1 : s));
    }, 220);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (shown < lines.length) return;
    const t = setInterval(() => {
      setInsightIdx((i) => (i + 1) % (insights.length + 1));
    }, 1800);
    return () => clearInterval(t);
  }, [shown]);

  return (
    <div className="gradient-border relative overflow-hidden p-1 glow-violet">
      <div className="rounded-2xl bg-[oklch(0.12_0.008_280)] overflow-hidden">
        {/* window chrome */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-destructive/80" />
            <span className="h-3 w-3 rounded-full bg-warning/80" />
            <span className="h-3 w-3 rounded-full bg-success/80" />
            <span className="ml-3 font-mono text-xs text-muted-foreground">fetchUserData.ts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-electric pulse-ring" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-electric" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">AI scanning</span>
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_240px]">
          {/* code */}
          <div className="font-mono text-[13px] leading-6 p-5 relative">
            {lines.slice(0, shown).map((l, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-4"
              >
                <span className="text-muted-foreground/40 w-4 text-right select-none">{i + 1}</span>
                <span className={l.c}>
                  {l.t}
                  {i === shown - 1 && shown < lines.length && <span className="caret" />}
                </span>
              </motion.div>
            ))}

            {/* highlighted line */}
            {insightIdx >= 0 && insightIdx < insights.length && (
              <motion.div
                key={insightIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute left-0 right-0 h-6 bg-gradient-to-r from-electric/10 via-violet-glow/10 to-transparent pointer-events-none"
                style={{ top: `${20 + insights[insightIdx].line * 24}px` }}
              />
            )}
          </div>

          {/* AI insights panel */}
          <div className="border-l border-border/60 bg-[oklch(0.10_0.008_280)] p-3 space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">AI Insights</div>
            {insights.map((ins, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: insightIdx >= i ? 1 : 0.15, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-lg border border-border/60 bg-surface/60 p-2.5"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      ins.color === "warning" ? "bg-warning" :
                      ins.color === "destructive" ? "bg-destructive" : "bg-electric"
                    }`}
                  />
                  <span className="font-mono text-[10px] uppercase text-muted-foreground">{ins.type}</span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">L{ins.line + 1}</span>
                </div>
                <p className="mt-1 text-xs text-foreground/90 leading-snug">{ins.text}</p>
              </motion.div>
            ))}

            <div className="pt-2 mt-2 border-t border-border/60">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-muted-foreground">SCORE</span>
                <span className="text-success">+18%</span>
              </div>
              <div className="mt-1.5 h-1 rounded-full bg-surface overflow-hidden">
                <motion.div
                  initial={{ width: "30%" }}
                  animate={{ width: "82%" }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="h-full bg-gradient-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
