import { create } from 'zustand';
import { useLocation, useParams } from '@tanstack/react-router';
import { useAuth } from '@clerk/clerk-react';


export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: string[];
  createdAt: Date;
}

interface CopilotState {
  isOpen: boolean;
  conversationId: string | null;
  messages: ChatMessage[];
  isTyping: boolean;
  activeTool: string | null;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  setConversationId: (id: string | null) => void;
  addMessage: (msg: ChatMessage) => void;
  appendChunk: (content: string) => void;
  setActiveTool: (tool: string | null) => void;
  clearMessages: () => void;
  setMessages: (msgs: ChatMessage[]) => void;
  fetchHistory: (workspaceId: string, getToken: () => Promise<string | null>) => Promise<any[]>;
  loadConversation: (conversationId: string, getToken: () => Promise<string | null>) => Promise<void>;
}

export const useCopilotStore = create<CopilotState>((set) => ({
  isOpen: false,
  conversationId: null,
  messages: [],
  isTyping: false,
  activeTool: null,
  toggleOpen: () => set((state) => {
    // When opening, reset the chat if it was closed
    if (!state.isOpen) {
      return { isOpen: true, messages: [], conversationId: null, activeTool: null };
    }
    return { isOpen: false };
  }),
  setOpen: (open) => set({ isOpen: open }),
  setConversationId: (id) => set({ conversationId: id }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  appendChunk: (content) => set((state) => {
    const msgs = [...state.messages];
    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg && lastMsg.role === 'assistant') {
      lastMsg.content += content;
    } else {
      msgs.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content,
        createdAt: new Date(),
      });
    }
    return { messages: msgs };
  }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  clearMessages: () => set({ messages: [], conversationId: null }),
  setMessages: (msgs) => set({ messages: msgs }),
  fetchHistory: async (workspaceId, getToken) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const token = await getToken();
      const res = await fetch(`${API_URL}/copilot/history?workspaceId=${workspaceId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  loadConversation: async (conversationId, getToken) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const token = await getToken();
      const res = await fetch(`${API_URL}/copilot/history/${conversationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.data) {
        set({ messages: json.data, conversationId, isOpen: true });
      }
    } catch (e) {
      console.error(e);
    }
  }
}));

// Export a helpful hook that combines the store with React Router context
export function useCopilot() {
  const store = useCopilotStore();
  const location = useLocation();
  const { getToken } = useAuth();
  
  // Extract context from URL
  const context = {
    currentPage: location.pathname,
    // Try to extract IDs if they exist in the URL pattern
    repositoryId: location.pathname.includes('/repositories/') ? location.pathname.split('/repositories/')[1]?.split('/')[0] : undefined,
    reviewId: location.pathname.includes('/reviews/') ? location.pathname.split('/reviews/')[1]?.split('/')[0] : undefined,
  };

  const sendMessage = async (message: string, workspaceId: string) => {
    if (!message.trim() || !workspaceId) return;

    store.addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      createdAt: new Date()
    });
    
    // Add empty assistant message to show the interactive loading state
    store.addMessage({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      createdAt: new Date()
    });
    
    store.setOpen(true);
    useCopilotStore.setState({ isTyping: true, activeTool: null });

    try {
      const token = await getToken();
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${API_URL}/copilot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message,
          context,
          workspaceId,
          conversationId: store.conversationId,
        })
      });

      if (!response.ok) {
        let errorMsg = "AI Service Error";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch(e) {}
        throw new Error(errorMsg);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'tool_call') {
                store.setActiveTool(data.tool);
              } else if (data.type === 'content') {
                store.setActiveTool(null); // Clear tool spinner
                store.appendChunk(data.content);
              } else if (data.type === 'error') {
                console.error("Copilot Stream Error:", data.content);
                store.setActiveTool(null);
                store.appendChunk(`\n\n**Error:** ${data.content}`);
              }
            } catch (e) {
              // Ignore parse errors from partial chunks
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Failed to send message:", error);
      store.setActiveTool(null);
      store.appendChunk(`**Connection Error:** ${error.message || 'Failed to reach the AI engine.'}`);
    } finally {
      useCopilotStore.setState({ isTyping: false, activeTool: null });
    }
  };

  return {
    ...store,
    context,
    sendMessage,
    fetchHistory: (workspaceId: string) => store.fetchHistory(workspaceId, getToken),
    loadConversation: (conversationId: string) => store.loadConversation(conversationId, getToken),
  };
}
