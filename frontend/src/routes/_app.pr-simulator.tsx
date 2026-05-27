import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Check, X, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/app/PageBits";
import { DiffViewer } from "../features/pr-simulator/components/DiffViewer";
import { AgentConversation } from "../features/pr-simulator/components/AgentConversation";
import { api } from "../services/api/client";
import { io } from "socket.io-client";

export const Route = createFileRoute("/_app/pr-simulator")({
  component: PRSim,
});

const reviewers = [
  { id: "cto", name: "CTO", color: "from-violet-glow to-fuchsia-500" },
  { id: "senior", name: "Senior Engineer", color: "from-electric to-cyan-400" },
  { id: "security", name: "Security Lead", color: "from-rose-400 to-red-500" },
  { id: "perf", name: "Performance Engineer", color: "from-amber-400 to-orange-500" },
  { id: "devops", name: "DevOps Engineer", color: "from-blue-500 to-indigo-500" },
  { id: "architect", name: "Staff Architect", color: "from-emerald-400 to-teal-500" }
];

function PRSim() {
  const [activeAgent, setActiveAgent] = useState("security");
  const [prId, setPrId] = useState<string | null>(null);
  const [prData, setPrData] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [rawDiffInput, setRawDiffInput] = useState("");
  const [showInput, setShowInput] = useState(true);
  const [mergeError, setMergeError] = useState<string | null>(null);

  // Poll for PR data when simulating
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (prId && isSimulating) {
      interval = setInterval(() => {
        api.get(`/v1/pr/${prId}`).then((res: any) => {
          setPrData(res);
          if (res.status !== 'analyzing') {
            setIsSimulating(false);
          }
        }).catch(console.error);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [prId, isSimulating]);

  // Socket for live updates
  useEffect(() => {
    const socketUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace('/api/v1', '');
    const socket = io(socketUrl, { withCredentials: true });
    socket.on('pr:status-updated', (data) => {
      if (data.prId === prId) {
        setIsSimulating(false);
        api.get(`/v1/pr/${prId}`).then((res: any) => setPrData(res));
      }
    });
    return () => { socket.disconnect(); };
  }, [prId]);

  const handleStartSim = async () => {
    if (!rawDiffInput.trim()) return;
    try {
      setShowInput(false);
      setIsSimulating(true);
      const res = await api.post("/v1/pr/simulate", {
        title: "Test PR Simulation",
        branch: "feature/test",
        rawDiff: rawDiffInput
      });
      setPrId((res as any).prId);
    } catch (e) {
      console.error(e);
      setShowInput(true);
      setIsSimulating(false);
    }
  };

  const getVerdict = (agentName: string) => {
    if (!prData?.reviews) return "Waiting...";
    const r = prData.reviews.find((r: any) => r.agent === agentName);
    if (!r) return "Waiting...";
    if (r.verdict === "BLOCK") return "Blocking";
    if (r.verdict === "REQUEST_CHANGES") return "Request changes";
    if (r.verdict === "APPROVE") return "Approved";
    return "Commented";
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!prId || isSimulating) return;
    setMergeError(null);
    try {
      const res = await api.patch(`/v1/pr/${prId}/status`, { status: newStatus });
      setPrData((prev: any) => ({ ...prev, status: res.data?.pr?.status || newStatus }));
    } catch (e: any) {
      console.error(e);
      // If the backend rejects the merge (e.g. because of a BLOCKING review), show the error message.
      if (newStatus === 'merged' && e.message) {
        setMergeError(e.message);
      }
    }
  };

  const handleNewPR = () => {
    setShowInput(true);
    setPrId(null);
    setPrData(null);
    setRawDiffInput("");
    setMergeError(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="PR Review Simulator"
        sub="See your PR from six senior perspectives — before humans see it."
        action={
          <div className="flex gap-2">
            <button 
              onClick={handleNewPR}
              className="px-3 py-1.5 rounded-lg border border-border text-sm"
            >
              New PR
            </button>
            <button 
              onClick={() => handleUpdateStatus('changes_requested')}
              disabled={!prId || isSimulating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-sm disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" /> Request changes
            </button>
            <button 
              onClick={() => handleUpdateStatus('merged')}
              disabled={!prId || isSimulating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-primary text-primary-foreground text-sm glow disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" /> Approve & merge
            </button>
          </div>
        }
      />

      {showInput ? (
        <div className="gradient-border p-6 mt-8 max-w-3xl mx-auto">
          <h3 className="text-lg font-medium mb-4">Ingest Pull Request</h3>
          <p className="text-sm text-muted-foreground mb-4">Paste a raw Git diff below to simulate how the AI engineering team would review it.</p>
          <textarea 
            className="w-full h-[300px] bg-surface/50 border border-border rounded-lg p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-electric mb-4"
            placeholder="diff --git a/file.ts b/file.ts..."
            value={rawDiffInput}
            onChange={(e) => setRawDiffInput(e.target.value)}
          />
          <button 
            onClick={handleStartSim}
            disabled={!rawDiffInput.trim()}
            className="w-full py-2.5 rounded-lg bg-electric text-background font-medium hover:bg-electric/90 disabled:opacity-50"
          >
            Start Multi-Agent Simulation
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 mt-6">
            {reviewers.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveAgent(r.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm whitespace-nowrap transition ${
                  activeAgent === r.id ? "border-electric bg-electric/10" : "border-border bg-surface/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={`h-2 w-2 rounded-full bg-gradient-to-br ${r.color}`} />
                {r.name}
                <span className="text-[10px] font-mono opacity-70">· {getVerdict(r.name)}</span>
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <DiffViewer files={prData?.files || []} />
            </div>
            <div>
              <AgentConversation 
                activeAgent={activeAgent} 
                agents={reviewers}
                reviews={prData?.reviews || []} 
                isSimulating={isSimulating} 
              />
              
              {prData && !isSimulating && prData.status === 'blocked' && (
                <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div>
                    <span className="font-medium">PR Blocked by Engineering Panel</span>
                    <p className="mt-1 opacity-80">This PR contains critical vulnerabilities or severe architectural regressions. It cannot be merged.</p>
                  </div>
                </div>
              )}
              
              {mergeError && (
                <div className="mt-4 p-4 rounded-lg bg-destructive border border-destructive/80 text-destructive-foreground text-sm flex gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0 text-white" />
                  <div>
                    <span className="font-bold text-white">Merge Rejected</span>
                    <p className="mt-1 text-white/90">{mergeError}</p>
                  </div>
                </div>
              )}
              
              {prData && !isSimulating && prData.status === 'merged' && (
                <div className="mt-4 p-4 rounded-lg bg-success/10 border border-success/30 text-success text-sm flex gap-2">
                  <Check className="h-5 w-5 shrink-0" />
                  <div>
                    <span className="font-medium">Pull Request Merged</span>
                    <p className="mt-1 opacity-80">This PR has been approved and merged into the main branch successfully!</p>
                  </div>
                </div>
              )}

              {prData && !isSimulating && prData.status === 'changes_requested' && (
                <div className="mt-4 p-4 rounded-lg bg-warning/10 border border-warning/30 text-warning text-sm flex gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div>
                    <span className="font-medium">Changes Requested</span>
                    <p className="mt-1 opacity-80">You have manually requested changes. The author will be notified to update the PR.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
