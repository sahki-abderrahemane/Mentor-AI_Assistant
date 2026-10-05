import {
  addUserMessage as mockAddUserMessage,
  listConversations as mockListConvs,
  updateConversation as mockUpdateConv,
  streamAssistantReply as mockStream,
} from "@/mock/chat/handlers";
import { getApiClient, getRealClient, readAccessToken } from "@/lib/api";
import { API_URL } from "@/lib/constants";
import type { MockCitation } from "@/mock/chat/data";

export interface StreamHandlers {
  onDelta?: (delta: { delta: string; done: boolean; citations?: MockCitation[] }) => void;
  onMessage?: (message: Awaited<ReturnType<typeof mockAddUserMessage>>) => void;
  onAssistantSaved?: (message: unknown) => void;
  signal?: { aborted: boolean };
}

export interface SendMessageArgs {
  conversationId: string;
  content: string;
  model?: string;
  collectionIds?: string[];
  documentIds?: string[];
}

export interface CreateConversationInput {
  title?: string;
  model?: string;
  projectId?: string;
}

export const chatService = {
  listConversations(args?: Parameters<typeof mockListConvs>[0]) {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.chat.listConversations(args ?? {});
    return c.real.get("/chat/conversations", { params: args }).then((r) => r.data);
  },
  getConversation(id: string) {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.chat.getConversation(id);
    // Backend Conversation entity doesn't eager-load `messages` (no eager:true on
    // the OneToMany). Mock contract returns a single object with `.messages`
    // populated, so here we fetch both endpoints and merge to keep the same shape.
    return Promise.all([
      c.real.get(`/chat/conversations/${id}`).then((r) => r.data),
      c.real.get(`/chat/conversations/${id}/messages`).then((r) => r.data),
    ]).then(([conv, messages]) => ({ ...conv, messages: messages ?? [] }));
  },
  createConversation(input?: Record<string, unknown>) {
    const c = getApiClient();
    const body: CreateConversationInput = {};
    if (typeof input?.title === "string") body.title = input.title;
    if (typeof input?.model === "string") body.model = input.model;
    if (typeof input?.projectId === "string") body.projectId = input.projectId;
    if (c.kind === "mock") return c.mock.chat.createConversation(body);
    return c.real.post("/chat/conversations", body).then((r) => r.data);
  },
  deleteConversation(id: string) {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.chat.deleteConversation(id);
    return c.real.delete(`/chat/conversations/${id}`).then((r) => r.data);
  },
  updateConversation(id: string, patch: Parameters<typeof mockUpdateConv>[1]) {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.chat.updateConversation(id, patch);
    return c.real.patch(`/chat/conversations/${id}`, patch).then((r) => r.data);
  },
  listFolders() {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.chat.listConversationFolders();
    return c.real.get("/chat/folders").then((r) => r.data);
  },
  listModels() {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.chat.listChatModels();
    return c.real.get("/chat/models").then((r) => r.data);
  },

  async sendMessage(input: SendMessageArgs, handlers: StreamHandlers = {}): Promise<MockCitation[]> {
    const c = getApiClient();
    if (c.kind === "mock") {
      const userMsg = await mockAddUserMessage(input);
      handlers.onMessage?.(userMsg);
      const citations: MockCitation[] = [];
      await new Promise<void>((resolve, reject) =>
        mockStream(
          input,
          (d) => {
            handlers.onDelta?.(d);
            if (d.citations) {
              citations.length = 0;
              citations.push(...d.citations);
            }
            if (d.done) resolve();
          },
          handlers.signal
        ).catch(reject)
      );
      return citations;
    }
    return realSendMessage(input, handlers);
  },

  streamMessage(input: SendMessageArgs, handlers: StreamHandlers = {}) {
    const signal = handlers.signal ?? { aborted: false };
    const c = getApiClient();
    if (c.kind === "mock") {
      const promise = chatService.sendMessage(input, { ...handlers, signal });
      return {
        promise,
        cancel: () => {
          signal.aborted = true;
        },
      };
    }
    return openAssistantStream(input, handlers);
  },
};

async function realSendMessage(input: SendMessageArgs, handlers: StreamHandlers): Promise<MockCitation[]> {
  void handlers;
  const real = getRealClient();
  await real.post(`/chat/conversations/${input.conversationId}/messages`, {
    content: input.content,
    model: input.model,
    ...(input.documentIds ? { documentIds: input.documentIds } : {}),
  });
  return [] as MockCitation[];
}

function openAssistantStream(
  input: SendMessageArgs,
  handlers: StreamHandlers,
): { promise: Promise<MockCitation[]>; cancel: () => void } {
  const params = new URLSearchParams();
  params.set("content", input.content);
  if (input.model) params.set("model", input.model);
  if (input.documentIds && input.documentIds.length > 0) params.set("documentIds", input.documentIds.join(","));

  const accessToken = readAccessToken();
  if (accessToken) params.set("access_token", accessToken);

  const url = `${API_URL}/chat/conversations/${input.conversationId}/stream?${params.toString()}`;
  const es = new EventSource(url, { withCredentials: true });

  const citations: MockCitation[] = [];
  let settled = false;
  let resolvePromise: (value: MockCitation[]) => void = () => {};
  const promise = new Promise<MockCitation[]>((resolve) => {
    resolvePromise = resolve;
  });

  function finish() {
    if (settled) return;
    settled = true;
    es.close();
    resolvePromise([...citations]);
  }

  es.onmessage = (ev) => {
    if (handlers.signal?.aborted) {
      finish();
      return;
    }
    try {
      const payload = JSON.parse(ev.data) as {
        delta?: string;
        done?: boolean;
        citations?: MockCitation[];
        type?: string;
        message?: unknown;
      };
      if (typeof payload.delta === "string") {
        if (payload.citations) {
          citations.length = 0;
          citations.push(...payload.citations);
        }
        handlers.onDelta?.({ delta: payload.delta, done: !!payload.done, citations: payload.citations });
      } else if (payload.type === "assistant_saved") {
        if (payload.message) handlers.onAssistantSaved?.(payload.message);
        finish();
      } else if (payload.done) {
        finish();
      }
    } catch {
      // ignore malformed
    }
  };
  es.onerror = () => {
    finish();
  };
  return {
    promise,
    cancel: finish,
  };
}
