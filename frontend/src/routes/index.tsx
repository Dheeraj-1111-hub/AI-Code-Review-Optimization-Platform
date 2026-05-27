import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight, PlayCircle, Github, Twitter, Cpu, GitPullRequest, Activity,
  Brain, Layers, Sparkles, Upload, Search, Shield, Gauge, Network, Wand2,
} from "lucide-react";
import { HeroCodeReview } from "@/components/landing/HeroCodeReview";
import { AgentsGrid } from "@/components/landing/AgentsGrid";
import { Benchmarks } from "@/components/landing/Benchmarks";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <section className="border-t border-border/40 py-24 px-6 relative">
        <SectionHeading
          kicker="Multi-agent intelligence"
          title="Five specialized AI reviewers, one verdict"
          sub="Each agent owns a slice of engineering excellence — and collaborates in real time."
        />
        <div className="max-w-6xl mx-auto mt-12"><AgentsGrid /></div>
      </section>

      <section className="border-t border-border/40 py-24 px-6 bg-mesh">
        <SectionHeading
          kicker="Measurable outcomes"
          title="Benchmarks that ship to production"
          sub="Stop guessing. DevLens tracks every metric that matters across every PR."
        />
        <div className="max-w-6xl mx-auto mt-12"><Benchmarks /></div>
      </section>

      <WhySection />
      <WorkflowSection />
      <CTASection />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#agents" className="hover:text-foreground transition">Agents</a>
          <a href="#workflow" className="hover:text-foreground transition">Workflow</a>
          <a href="#why" className="hover:text-foreground transition">Why DevLens</a>
          <a href="#" className="hover:text-foreground transition">Docs</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden sm:inline text-sm px-3 py-1.5 text-muted-foreground hover:text-foreground transition">
            Sign in
          </Link>
          <Link
            to="/dashboard"
            className="text-sm px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground font-medium glow hover:scale-[1.02] transition-transform inline-flex items-center gap-1.5"
          >
            Launch console <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <div className="absolute inset-0 bg-mesh" />

      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-28 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/60 px-3 py-1 text-xs font-mono"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-electric pulse-ring" />
            <span className="text-muted-foreground">v2.0 · multi-agent engine</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="mt-6 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
          >
            AI-Powered
            <br />
            <span className="text-gradient">Engineering</span>
            <br />
            Intelligence.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed"
          >
            Analyze, optimize, secure, and evolve codebases with multi-agent AI reviewers.
            DevLens reads your repo the way a staff engineer would — at 10,000× the speed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 font-medium text-primary-foreground glow hover:scale-[1.02] transition-transform"
            >
              Start reviewing <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/review"
              className="group inline-flex items-center gap-2 rounded-xl border border-electric/40 bg-electric/10 px-6 py-3 font-medium text-electric hover:bg-electric/20 hover:scale-[1.02] transition-all duration-300"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <PlayCircle className="h-4 w-4" />
              </motion.div>
              Try Live Demo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="mt-10 grid grid-cols-3 gap-6 max-w-md"
          >
            {[
              { v: "10M+", l: "lines reviewed" },
              { v: "92%", l: "issues caught" },
              { v: "<4s", l: "avg scan" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl font-bold text-gradient">{s.v}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-8 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
          <div className="relative float-y">
            <HeroCodeReview />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SectionHeading({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/60 px-3 py-1 text-xs font-mono text-electric">
        <Sparkles className="h-3 w-3" /> {kicker}
      </div>
      <h2 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight">{title}</h2>
      <p className="mt-4 text-muted-foreground">{sub}</p>
    </div>
  );
}

const whyItems = [
  { icon: Brain, t: "Multi-agent intelligence", d: "Five specialized reviewers debate your PR before it merges." },
  { icon: GitPullRequest, t: "PR review simulation", d: "See how a CTO, senior, and security lead would respond." },
  { icon: Layers, t: "Architecture scoring", d: "Module boundaries, coupling, scalability — quantified." },
  { icon: Cpu, t: "Team memory", d: "Agents remember your conventions, patterns, and past decisions." },
  { icon: Activity, t: "Performance prediction", d: "Predict runtime regressions before they hit production." },
  { icon: Wand2, t: "AI mentorship", d: "Recurring mistakes become personalized lessons." },
];

function WhySection() {
  return (
    <section id="why" className="border-t border-border/40 py-24 px-6">
      <SectionHeading
        kicker="Why DevLens AI"
        title="Beyond linting. This is engineering judgment."
        sub="DevLens doesn't flag style. It reasons about your system."
      />
      <div className="max-w-6xl mx-auto mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {whyItems.map((w, i) => (
          <motion.div
            key={w.t}
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="group rounded-2xl border border-border/60 bg-surface/40 p-6 hover:border-electric/40 hover:bg-surface/70 transition"
          >
            <div className="h-10 w-10 rounded-lg bg-gradient-primary/20 flex items-center justify-center group-hover:bg-gradient-primary/40 transition">
              <w.icon className="h-5 w-5 text-electric" />
            </div>
            <h3 className="mt-4 font-semibold">{w.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{w.d}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const steps = [
  { icon: Upload, t: "Upload code", d: "Connect repo or drop a file" },
  { icon: Search, t: "AI parsing", d: "AST + semantic graph" },
  { icon: Shield, t: "Security scan", d: "CVE + injection + auth" },
  { icon: Gauge, t: "Optimization", d: "Complexity + bottlenecks" },
  { icon: Network, t: "Architecture", d: "Patterns + boundaries" },
  { icon: Wand2, t: "Refactor", d: "Production-ready patches" },
];

function WorkflowSection() {
  return (
    <section id="workflow" className="border-t border-border/40 py-24 px-6 bg-mesh">
      <SectionHeading
        kicker="Workflow"
        title="From upload to refactor in under 30 seconds"
        sub="An end-to-end engineering pipeline, fully autonomous."
      />
      <div className="max-w-6xl mx-auto mt-14 relative">
        <div className="absolute left-0 right-0 top-7 h-px bg-gradient-to-r from-transparent via-electric/40 to-transparent hidden md:block" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.t}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <div className="relative mx-auto h-14 w-14 rounded-2xl bg-surface border border-border flex items-center justify-center">
                <s.icon className="h-6 w-6 text-electric" />
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gradient-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                  {i + 1}
                </span>
              </div>
              <h4 className="mt-3 font-medium text-sm">{s.t}</h4>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="border-t border-border/40 py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="max-w-4xl mx-auto gradient-border p-12 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <div className="relative">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Ship code your <span className="text-gradient">staff engineer</span> would approve.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Join engineering teams using DevLens AI to review, refactor, and reason about code at machine speed.
          </p>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 font-medium text-primary-foreground glow hover:scale-[1.05] transition-all">
              Launch console <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/review" className="group inline-flex items-center gap-2 rounded-xl border border-electric/40 bg-electric/10 px-6 py-3 font-medium text-electric hover:bg-electric/20 hover:scale-[1.05] transition-all">
              <PlayCircle className="h-4 w-4 group-hover:text-white transition-colors" /> Try Live Demo
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/40 py-12 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            The Cursor for engineering intelligence. Built for teams that ship.
          </p>
        </div>
        {[
          { title: "Product", links: ["Agents", "Pricing", "Changelog", "Roadmap"] },
          { title: "Resources", links: ["Docs", "API", "Guides", "Community"] },
          { title: "Company", links: ["About", "Privacy", "Terms", "Security"] },
        ].map((c) => (
          <div key={c.title}>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{c.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l}><a href="#" className="text-foreground/80 hover:text-electric transition">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>© 2026 DevLens AI · All systems operational</span>
        <div className="flex items-center gap-3">
          <a href="#" className="hover:text-foreground transition"><Github className="h-4 w-4" /></a>
          <a href="#" className="hover:text-foreground transition"><Twitter className="h-4 w-4" /></a>
        </div>
      </div>
    </footer>
  );
}
