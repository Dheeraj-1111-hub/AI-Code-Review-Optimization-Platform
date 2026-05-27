import { memo, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, Cpu, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/hooks/useCopilot";

export const ChatMessage = memo(({ message, isTyping, activeTool }: { message: ChatMessageType, isTyping?: boolean, activeTool?: string | null }) => {
  const isAssistant = message.role === "assistant";

  // Dynamic loading phrases
  const loadingPhrases = [
    "Analyzing prompt...",
    "Scanning workspace...",
    "Consulting engineering agents...",
    "Compiling intelligence...",
    "Synthesizing response..."
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    if (isTyping && !message.content && !activeTool) {
      const interval = setInterval(() => {
        setPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isTyping, message.content, activeTool, loadingPhrases.length]);

  return (
    <div className={cn("flex w-full gap-3 py-4", isAssistant ? "justify-start" : "justify-end")}>
      {isAssistant && (
        <div className="h-8 w-8 rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-950 flex items-center justify-center shrink-0 shadow-sm border border-zinc-700/50">
          <Cpu className="h-4 w-4 text-zinc-300" strokeWidth={1.5} />
        </div>
      )}

      <div
        className={cn(
          "flex flex-col gap-2 max-w-[85%]",
          isAssistant ? "items-start" : "items-end"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isAssistant
              ? "bg-surface/50 border border-border/50 text-foreground"
              : "bg-electric text-white rounded-tr-sm"
          )}
        >
          <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-background/50 prose-pre:border prose-pre:border-border/50 max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
            {isTyping && isAssistant && !message.content && !activeTool && (
              <div className="flex flex-col gap-3 py-2 opacity-80">
                <div className="flex items-center gap-3 text-electric font-mono text-xs">
                  <Bot className="h-4 w-4 animate-pulse" />
                  <span className="animate-pulse">{loadingPhrases[phraseIndex]}</span>
                </div>
                <div className="flex items-center gap-1.5 ml-7">
                  <span className="w-1.5 h-1.5 rounded-full bg-electric animate-[bounce_1s_infinite_0ms]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-electric animate-[bounce_1s_infinite_200ms]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-electric animate-[bounce_1s_infinite_400ms]"></span>
                </div>
              </div>
            )}
            {isTyping && isAssistant && message.content && (
              <span className="caret ml-1" />
            )}
          </div>
        </div>

        {/* Tool Call Indicator if this is the active message being generated */}
        {isAssistant && activeTool && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-surface/30 border border-border/30 rounded-lg px-3 py-1.5 animate-pulse mt-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-electric" />
            <span>Using tool: <span className="font-mono text-electric">{activeTool}</span>...</span>
          </div>
        )}
      </div>

      {!isAssistant && (
        <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center shrink-0 border border-border/50">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
});

ChatMessage.displayName = "ChatMessage";
