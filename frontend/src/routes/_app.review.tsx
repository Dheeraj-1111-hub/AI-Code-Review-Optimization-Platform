import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/app/PageBits";
import { ReviewStreamPanel } from "@/features/reviews/ReviewStreamPanel";
import { AgentTabs } from "@/features/reviews/AgentTabs";
import { ScoreVisualizer } from "@/features/reviews/ScoreVisualizer";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
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
  
  const { files, activeFileId } = useEditorStore();
  const activeFile = files.find(f => f.id === activeFileId);
  
  const { 
    isStreaming, 
    setStreaming, 
    setStatusMessage, 
    setCompleteResult, 
    resetStream, 
    scores, 
    agentResults,
    statusMessage
  } = useAIStore();
  
  // We compute a local "status" enum compatible with ReviewStreamPanel based on store
  const status = isStreaming ? 'analyzing' : (scores ? 'completed' : 'idle');

  useEffect(() => {
    // Setup socket listeners
    socket.on('review-chunk', (data: any) => {
      if (data.type === 'status') {
        setStatusMessage(data.message);
        setMessages(prev => [...prev, data.message]);
      } else if (data.type === 'complete') {
        setMessages(prev => [...prev, "Analysis complete! Generating comprehensive report..."]);
        setCompleteResult(data.result);
        toast.success("AI Analysis Complete!");
      } else if (data.type === 'error') {
        setStreaming(false);
        setMessages(prev => [...prev, `Error: ${data.message}`]);
        toast.error("AI Analysis failed.");
      }
    });

    socket.on('review-error', (data: any) => {
      setStreaming(false);
      setMessages(prev => [...prev, `Error: ${data.message}`]);
      toast.error(data.message);
    });

    return () => {
      socket.off('review-chunk');
      socket.off('review-error');
    };
  }, []);

  const handleStartReview = async () => {
    try {
      resetStream();
      setStreaming(true);
      setMessages(["Initializing DevLens AI Engine..."]);

      // Authenticate and connect socket FIRST, wait for connection
      const token = await getToken();
      if (!socket.connected) {
        socket.auth = { token };
        socket.connect();
        // Wait for socket to actually connect before proceeding
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Socket connection timeout')), 10000);
          socket.once('connect', () => { clearTimeout(timeout); resolve(); });
          socket.once('connect_error', (err) => { clearTimeout(timeout); reject(err); });
        });
      }

      // Trigger the backend to start the review
      const res: any = await api.post('/v1/reviews/start', {
        code: activeFile?.content || '',
        language: activeFile?.language || 'typescript'
      });

      // Join the specific room for this review immediately
      socket.emit('join-review', res.reviewId);

    } catch (error) {
      console.error(error);
      setStreaming(false);
      toast.error("Failed to start review. Check console.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="AI Engineering Review"
        sub="Multi-Agent Code Intelligence Pipeline"
        action={
          <Button 
            variant="aceternity" 
            onClick={handleStartReview}
            disabled={status === 'analyzing'}
          >
            <Play className="h-4 w-4 mr-2" />
            {status === 'analyzing' ? 'Analyzing...' : 'Start Review'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Side */}
        <motion.div 
          className="flex flex-col gap-6 relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Glowing effect when analyzing */}
          {status === 'analyzing' && (
            <motion.div 
              className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-xl blur-md -z-10"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}

          <MonacoWorkspace />

          <ReviewStreamPanel status={status} messages={messages} />
        </motion.div>

        {/* Results Side */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={status}
            className="flex flex-col gap-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {status === 'idle' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xl text-muted-foreground bg-surface/50 h-full">
                <motion.div 
                  className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                >
                  <Play className="h-8 w-8 text-primary opacity-80 pl-1" />
                </motion.div>
                <h3 className="text-lg font-medium text-foreground mb-2">Ready for Analysis</h3>
                <p className="max-w-md">Paste your code in the editor and click Start Review to trigger the multi-agent AI pipeline. DevLens will analyze security, performance, architecture, and more.</p>
              </div>
            )}

            {status !== 'idle' && (
              <div className="space-y-6">
                {status === 'completed' && scores && <ScoreVisualizer scores={scores} />}
                <AgentTabs results={agentResults} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
