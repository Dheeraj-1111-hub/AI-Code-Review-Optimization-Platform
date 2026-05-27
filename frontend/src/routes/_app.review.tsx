import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ReviewStreamPanel } from "@/features/reviews/ReviewStreamPanel";
import { AgentTabs } from "@/features/reviews/AgentTabs";
import { ScoreVisualizer } from "@/features/reviews/ScoreVisualizer";
import { Button } from "@/components/ui/button";
import {
  Play,
  Square,
  Cpu,
  Sparkles,
  ChevronRight,
  CircleDot,
  Zap,
} from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { socket } from "@/lib/socket";
import { api } from "@/services/api/client";
import { toast } from "sonner";
import { useAIStore } from "@/store/ai.store";
import { motion, AnimatePresence } from "framer-motion";
import { MonacoWorkspace } from "@/features/review/components/editor/MonacoWorkspace";
import { useEditorStore } from "@/features/review/store/editor.store";

export const Route = createFileRoute("/_app/review")({
  component: ReviewWorkspace,
});

function ReviewWorkspace() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<string[]>([]);
  const [activePanel, setActivePanel] = useState<"pipeline" | "results">(
    "pipeline"
  );

  const { files, activeFileId } = useEditorStore();
  const activeFile = files.find((f) => f.id === activeFileId);

  const {
    isStreaming,
    setStreaming,
    setStatusMessage,
    setCompleteResult,
    resetStream,
    scores,
    agentResults,
  } = useAIStore();

  const status = isStreaming ? "analyzing" : scores ? "completed" : "idle";

  // Auto-switch to results when done
  useEffect(() => {
    if (status === "completed") {
      setActivePanel("results");
    }
  }, [status]);

  useEffect(() => {
    socket.on("review-chunk", (data: any) => {
      if (data.type === "status") {
        setStatusMessage(data.message);
        setMessages((prev) => [...prev, data.message]);
      } else if (data.type === "complete") {
        setMessages((prev) => [
          ...prev,
          "✓ Analysis complete. Generating report...",
        ]);
        setCompleteResult(data.result);
        toast.success("AI Analysis Complete!");
      } else if (data.type === "error") {
        setStreaming(false);
        setMessages((prev) => [...prev, `✗ Error: ${data.message}`]);
        toast.error("AI Analysis failed.");
      }
    });

    socket.on("review-error", (data: any) => {
      setStreaming(false);
      setMessages((prev) => [...prev, `✗ ${data.message}`]);
      toast.error(data.message);
    });

    return () => {
      socket.off("review-chunk");
      socket.off("review-error");
    };
  }, []);

  const handleStartReview = async () => {
    try {
      resetStream();
      setStreaming(true);
      setActivePanel("pipeline");
      setMessages(["Initializing DevLens AI Engine..."]);

      const token = await getToken();
      if (!socket.connected) {
        socket.auth = { token };
        socket.connect();
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(
            () => reject(new Error("Socket connection timeout")),
            10000
          );
          socket.once("connect", () => {
            clearTimeout(timeout);
            resolve();
          });
          socket.once("connect_error", (err) => {
            clearTimeout(timeout);
            reject(err);
          });
        });
      }

      const res: any = await api.post("/v1/reviews/start", {
        code: activeFile?.content || "",
        language: activeFile?.language || "typescript",
      });

      socket.emit("join-review", res.reviewId);
    } catch (error) {
      console.error(error);
      setStreaming(false);
      toast.error("Failed to start review.");
    }
  };

  const handleReset = () => {
    resetStream();
    setMessages([]);
    setActivePanel("pipeline");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-background overflow-hidden">
      {/* Top Command Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-primary">
            <Cpu className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-tight">
              AI Engineering Review
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
          <span className="text-xs text-muted-foreground font-mono">
            Multi-Agent Code Intelligence Pipeline
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status === "analyzing"
                  ? "bg-amber-400 animate-pulse"
                  : status === "completed"
                  ? "bg-emerald-400"
                  : "bg-muted-foreground/30"
              }`}
            />
            <span
              className={`text-xs font-medium ${
                status === "analyzing"
                  ? "text-amber-400"
                  : status === "completed"
                  ? "text-emerald-400"
                  : "text-muted-foreground"
              }`}
            >
              {status === "analyzing"
                ? "Running"
                : status === "completed"
                ? "Complete"
                : "Idle"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === "completed" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs h-8 gap-1.5"
            >
              <Square className="h-3 w-3" />
              New Review
            </Button>
          )}
          <Button
            onClick={handleStartReview}
            disabled={status === "analyzing"}
            size="sm"
            className="h-8 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/20 disabled:opacity-60"
          >
            {status === "analyzing" ? (
              <>
                <span className="h-3 w-3 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-current" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content — IDE Split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — Editor */}
        <motion.div
          className="flex flex-col flex-1 min-w-0 border-r border-border relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Analyzing glow overlay */}
          {status === "analyzing" && (
            <motion.div
              className="absolute inset-0 pointer-events-none z-10 border-2 border-primary/40 rounded-none"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}

          <div className="flex-1 overflow-hidden">
            <MonacoWorkspace />
          </div>
        </motion.div>

        {/* Right — Analysis Panel */}
        <div className="w-[420px] xl:w-[500px] flex flex-col flex-shrink-0 bg-surface overflow-hidden">
          {/* Panel Toggle Tabs */}
          <div className="flex items-center border-b border-border bg-surface flex-shrink-0">
            <button
              onClick={() => setActivePanel("pipeline")}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold transition-colors relative ${
                activePanel === "pipeline"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CircleDot
                className={`h-3.5 w-3.5 ${
                  status === "analyzing" ? "text-amber-400 animate-pulse" : ""
                }`}
              />
              Pipeline
              {activePanel === "pipeline" && (
                <motion.div
                  layoutId="panelIndicator"
                  className="absolute bottom-0 left-0 right-0 h-px bg-primary"
                />
              )}
            </button>
            <button
              onClick={() => setActivePanel("results")}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold transition-colors relative ${
                activePanel === "results"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles
                className={`h-3.5 w-3.5 ${
                  status === "completed" ? "text-primary" : ""
                }`}
              />
              Results
              {status === "completed" && activePanel !== "results" && (
                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              )}
              {activePanel === "results" && (
                <motion.div
                  layoutId="panelIndicator"
                  className="absolute bottom-0 left-0 right-0 h-px bg-primary"
                />
              )}
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activePanel === "pipeline" ? (
                <motion.div
                  key="pipeline"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 h-full"
                >
                  <ReviewStreamPanel status={status} messages={messages} />

                  {status === "idle" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-5 rounded-xl border border-dashed border-border text-center"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <Zap className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        Ready to Analyze
                      </p>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                        Paste or write code in the editor, then click{" "}
                        <span className="text-primary font-medium">
                          Run Analysis
                        </span>{" "}
                        to trigger the 5-agent AI pipeline.
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {[
                          "Security",
                          "Performance",
                          "Architecture",
                          "Refactoring",
                          "Clean Code",
                        ].map((agent) => (
                          <span
                            key={agent}
                            className="text-[10px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium"
                          >
                            {agent}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 space-y-4"
                >
                  {status === "idle" || (!scores && !agentResults?.length) ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                      <Sparkles className="h-10 w-10 mb-3 opacity-20" />
                      <p className="text-sm">
                        Run an analysis to see results here
                      </p>
                    </div>
                  ) : (
                    <>
                      {scores && <ScoreVisualizer scores={scores} />}
                      {agentResults && agentResults.length > 0 && (
                        <AgentTabs results={agentResults} />
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
