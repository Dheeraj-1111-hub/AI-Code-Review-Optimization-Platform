import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Cpu, Code, Shield, GitPullRequest, History, PlusCircle, MessageSquare } from "lucide-react";
import { useCopilot } from "@/hooks/useCopilot";
import { ChatMessage } from "./ChatMessage";
import { useWorkspaceSettings } from "@/features/settings/hooks/useSettings";

const SUGGESTED_PROMPTS = [
  { icon: Shield, text: "Which repo has the most security issues?" },
  { icon: GitPullRequest, text: "Summarize my latest reviews" },
  { icon: Code, text: "Find recurring architectural flaws" },
];

export function CopilotWorkspace() {
  const { isOpen, setOpen, messages, isTyping, activeTool, sendMessage, context, fetchHistory, loadConversation, clearMessages } = useCopilot();
  const { data: workspaceData } = useWorkspaceSettings();
  const currentWorkspaceId = workspaceData?._id;
  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch history when history panel opens
  useEffect(() => {
    if (showHistory && currentWorkspaceId) {
      fetchHistory(currentWorkspaceId).then(setHistoryList);
    }
  }, [showHistory, currentWorkspaceId, fetchHistory]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentWorkspaceId) return;
    sendMessage(input, currentWorkspaceId);
    setInput("");
  };

  const handleSuggest = (text: string) => {
    if (!currentWorkspaceId) return;
    sendMessage(text, currentWorkspaceId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile (optional, but good for focus) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-background/20 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full md:w-[450px] bg-background/95 backdrop-blur-2xl border-l border-border/40 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="h-16 shrink-0 border-b border-border/40 flex items-center justify-between px-6 bg-surface/20">
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 flex items-center justify-center rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-950 border border-zinc-700/50 shadow-sm">
                  <Cpu className="h-5 w-5 text-zinc-300" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">AI Copilot</h2>
                  <p className="text-xs text-muted-foreground font-mono">DevLens Engineering Intelligence</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none"
                  title="History"
                >
                  <History className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    clearMessages();
                    setShowHistory(false);
                  }}
                  className="p-2 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none"
                  title="New Chat"
                >
                  <PlusCircle className="h-5 w-5" />
                </button>
                <div className="w-px h-5 bg-border/50 mx-1" />
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* History Panel overlay */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "tween", duration: 0.2 }}
                  className="absolute inset-y-0 left-0 w-[280px] bg-background border-r border-border/50 z-20 shadow-2xl flex flex-col"
                >
                  <div className="p-4 border-b border-border/50 flex items-center justify-between">
                    <h3 className="font-medium text-sm">Conversation History</h3>
                    <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-surface rounded-md">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {historyList.length === 0 ? (
                      <div className="text-center text-xs text-muted-foreground p-4">No history yet.</div>
                    ) : (
                      historyList.map(h => (
                        <button
                          key={h._id}
                          onClick={() => {
                            loadConversation(h._id);
                            setShowHistory(false);
                          }}
                          className="w-full text-left p-3 hover:bg-surface/50 rounded-xl transition-colors flex items-start gap-3 group mb-1"
                        >
                          <MessageSquare className="h-4 w-4 text-muted-foreground group-hover:text-electric mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">{h.title || "New Conversation"}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {new Date(h.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Context Viewer Indicator */}
            <div className="px-6 py-2 bg-electric/5 border-b border-electric/10 flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Context Synced
              </span>
              <span className="font-mono text-electric truncate max-w-[200px]">
                {context.currentPage}
              </span>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
                  <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 border border-zinc-700/50 flex items-center justify-center mb-6 shadow-sm overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
                    <Cpu className="h-8 w-8 text-zinc-300" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">How can I help you today?</h3>
                  <p className="text-sm text-muted-foreground max-w-[250px] mx-auto mb-8">
                    I have full access to your workspace repositories, PRs, and security analytics.
                  </p>
                  
                  <div className="w-full flex flex-col gap-3">
                    {SUGGESTED_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggest(prompt.text)}
                        className="flex items-center gap-3 p-3 rounded-xl bg-surface/50 border border-border/50 hover:bg-surface hover:border-electric/30 transition-all text-left text-sm text-muted-foreground hover:text-foreground group"
                      >
                        <prompt.icon className="h-4 w-4 text-electric group-hover:scale-110 transition-transform" />
                        {prompt.text}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pb-4">
                  {messages.map((msg, index) => (
                    <ChatMessage 
                      key={msg.id} 
                      message={msg} 
                      isTyping={isTyping && index === messages.length - 1} 
                      activeTool={index === messages.length - 1 ? activeTool : null}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background border-t border-border/40">
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about your codebase..."
                  disabled={isTyping}
                  className="w-full bg-surface/60 border border-border/60 rounded-xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-electric focus:border-transparent disabled:opacity-50 transition-all placeholder:text-muted-foreground/50 shadow-sm"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 p-2 rounded-lg bg-electric text-white hover:bg-electric/90 disabled:opacity-50 disabled:hover:bg-electric transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-electric focus-visible:ring-offset-background"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <div className="text-center mt-3">
                <span className="text-[10px] text-muted-foreground font-mono">DevLens AI can make mistakes. Verify critical code.</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
