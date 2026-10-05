import type { AuditFields } from "./api.types";

export type ChatRole = "user" | "assistant" | "system";

export interface ChatCitation {
  id: string;
  documentId: string;
  documentTitle: string;
  collectionId?: string;
  collectionName?: string;
  projectId?: string;
  page?: number;
  section?: string;
  snippet: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: ChatRole;
  content: string;
  model?: string;
  citations?: ChatCitation[];
  createdAt: string;
  /** Streaming helper */
  isStreaming?: boolean;
  meta?: {
    inputTokens?: number;
    outputTokens?: number;
    latencyMs?: number;
  };
}

export interface Conversation extends AuditFields {
  id: string;
  title: string;
  folder?: string;
  userId: string;
  collectionIds?: string[];
  projectId?: string;
  messageCount: number;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  model: string;
  pinned: boolean;
  archived: boolean;
  starred: boolean;
  shared: boolean;
}

export interface ConversationFolder {
  id: string;
  name: string;
  conversationIds: string[];
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
  attachments?: string[];
  collectionIds?: string[];
  documentIds?: string[];
  model?: string;
}

export interface StreamDelta {
  messageId: string;
  delta: string;
  done: boolean;
  citations?: ChatCitation[];
}

export interface ChatModel {
  id: string;
  name: string;
  provider: string;
  description?: string;
  contextWindow?: number;
  enabled: boolean;
}
