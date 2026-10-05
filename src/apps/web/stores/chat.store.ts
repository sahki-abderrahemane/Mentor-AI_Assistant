import { create } from "zustand";

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  /** Streaming helper */
  isStreaming?: boolean;
  citations?: ChatCitation[];
}

export interface ChatCitation {
  id: string;
  documentId: string;
  documentTitle: string;
  page?: number;
  section?: string;
  snippet: string;
  score: number;
}

export interface ChatState {
  activeConversationId: string | null;
  streamingMessageId: string | null;
  stopRequested: boolean;
  setActiveConversation: (id: string | null) => void;
  setStreaming: (id: string | null) => void;
  requestStop: () => void;
  clearStop: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeConversationId: null,
  streamingMessageId: null,
  stopRequested: false,
  setActiveConversation: (id) => set({ activeConversationId: id }),
  setStreaming: (id) =>
    set({ streamingMessageId: id, stopRequested: false }),
  requestStop: () => set({ stopRequested: true }),
  clearStop: () => set({ stopRequested: false }),
}));
