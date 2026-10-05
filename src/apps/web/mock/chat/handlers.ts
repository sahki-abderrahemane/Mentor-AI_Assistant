import { delay, faker, id, paginate } from "../seed";
import {
  mockConversations,
  mockConversationFolders,
  mockChatModels,
} from "./data";
import { mockDocuments } from "../documents/data";
import { mockCollections } from "../collections/data";
import type { MockCitation, MockConversation } from "./data";

export interface ListConversationsParams {
  page?: number;
  pageSize?: number;
  folder?: string;
  query?: string;
  starred?: boolean;
  archived?: boolean;
  projectId?: string;
}

export async function listConversations(params: ListConversationsParams = {}) {
  await delay(120, 260);
  let result = [...mockConversations];
  if (params.folder) result = result.filter((c) => c.folder === params.folder);
  if (params.projectId) result = result.filter((c) => c.projectId === params.projectId);
  if (params.starred !== undefined) result = result.filter((c) => c.starred === params.starred);
  if (params.archived !== undefined) result = result.filter((c) => c.archived === params.archived);
  if (params.query) {
    const q = params.query.toLowerCase();
    result = result.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.lastMessagePreview?.toLowerCase().includes(q) ?? false)
    );
  }
  result.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return paginate(result, params.page ?? 1, params.pageSize ?? 20);
}

export async function getConversation(convId: string) {
  await delay(80, 200);
  const conv = mockConversations.find((c) => c.id === convId);
  if (!conv) throw new Error("Conversation not found");
  return conv;
}

export async function listConversationFolders() {
  await delay(60, 160);
  return [...mockConversationFolders];
}

export async function listChatModels() {
  await delay(40, 120);
  return [...mockChatModels];
}

export async function createConversation(input: Partial<MockConversation>) {
  await delay(120, 240);
  const convId = `conv_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  const conv: MockConversation = {
    id: convId,
    title: input.title ?? "New conversation",
    folder: input.folder,
    userId: "usr_current",
    collectionIds: input.collectionIds ?? [],
    projectId: input.projectId,
    messageCount: 0,
    model: input.model ?? mockChatModels[0]!.id,
    pinned: false,
    archived: false,
    starred: false,
    shared: false,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
  mockConversations.unshift(conv);
  return conv;
}

export async function deleteConversation(convId: string) {
  await delay(80, 180);
  const idx = mockConversations.findIndex((c) => c.id === convId);
  if (idx < 0) return;
  mockConversations.splice(idx, 1);
}

export async function updateConversation(convId: string, patch: Partial<MockConversation>) {
  await delay(80, 180);
  const idx = mockConversations.findIndex((c) => c.id === convId);
  if (idx < 0) throw new Error("Conversation not found");
  const updated = {
    ...mockConversations[idx]!,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  mockConversations[idx] = updated;
  return updated;
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
  model?: string;
  collectionIds?: string[];
}

export async function addUserMessage(input: SendMessageInput) {
  const conv = mockConversations.find((c) => c.id === input.conversationId);
  if (!conv) throw new Error("Conversation not found");
  await delay(60, 140);
  const message = {
    id: id("msg"),
    conversationId: input.conversationId,
    role: "user" as const,
    content: input.content,
    createdAt: new Date().toISOString(),
  };
  conv.messages.push(message);
  conv.messageCount = conv.messages.length;
  conv.lastMessagePreview = input.content.slice(0, 140);
  conv.lastMessageAt = message.createdAt;
  conv.updatedAt = message.createdAt;
  if (conv.title === "New conversation") {
    conv.title = input.content.slice(0, 60);
  }
  return message;
}

export async function addAssistantMessage(
  conversationId: string,
  content: string,
  citations: MockCitation[],
  model?: string
) {
  const conv = mockConversations.find((c) => c.id === conversationId);
  if (!conv) throw new Error("Conversation not found");
  await delay(40, 120);
  const message = {
    id: id("msg"),
    conversationId,
    role: "assistant" as const,
    content,
    model,
    citations,
    createdAt: new Date().toISOString(),
    meta: {
      inputTokens: faker.number.int({ min: 200, max: 800 }),
      outputTokens: faker.number.int({ min: 100, max: 600 }),
      latencyMs: faker.number.int({ min: 400, max: 2400 }),
    },
  };
  conv.messages.push(message);
  conv.messageCount = conv.messages.length;
  conv.lastMessagePreview = content.slice(0, 140);
  conv.lastMessageAt = message.createdAt;
  conv.updatedAt = message.createdAt;
  return message;
}

function buildCitations(seed: number): MockCitation[] {
  const ready = mockDocuments.filter((d) => d.status === "ready");
  const count = 1 + (seed % 3);
  return Array.from({ length: Math.min(count, ready.length) })
    .map((_, i) => ready[(seed * 7 + i * 11) % ready.length])
    .filter(Boolean)
    .map((doc, i) => ({
      id: id("cit"),
      documentId: doc.id,
      documentTitle: doc.title,
      collectionId: doc.collectionId,
      collectionName:
        mockCollections.find((c) => c.id === doc.collectionId)?.name ?? undefined,
      page: 1 + ((seed + i) % Math.max(1, doc.stats.pages ?? 12)),
      section: doc.knowledgeUnits[i]?.section ?? "Introduction",
      snippet: doc.preview.text.slice(0, 280),
      score: 0.7 + (((seed + i) % 30) / 100),
    }));
}

function buildAssistantReply(prompt: string): string {
  const p = prompt.toLowerCase();
  const intro = [
    "Based on the documents in your collections, here is a structured answer.",
    "Let me synthesize what the sources say — with citations attached.",
    "Here is a careful breakdown grounded in the indexed knowledge objects.",
    "Drawing from the chunks you provided, my best answer is below.",
  ][(prompt.length) % 4]!;
  if (p.includes("summarize") || p.includes("summary")) {
    return `${intro}\n\n**Summary**\n\n1. The approach uses hierarchical chunking.\n2. Citations tie back to knowledge units.\n3. The retrieval layer is hybrid (BM25 + dense).\n\nSee citations for the exact source location.`;
  }
  if (p.includes("compare")) {
    return `${intro}\n\n**Comparison**\n\n| Aspect | RAG | Long context |\n|---|---|---|\n| Cost | Lower | Higher |\n| Latency | Stable | Variable |\n| Grounding | Strong | Weak |\n\nLet me know which dimension matters most for your project.`;
  }
  if (p.includes("how")) {
    return `${intro}\n\n**Approach**\n\nUse a multi-stage pipeline:\n\n- Detect headings with a small classifier\n- Chunk at hierarchical boundaries\n- Embed with BGE-M3 and store in Qdrant\n- Re-rank with a cross-encoder\n\nCitations are derived from chunk metadata (page + section).`;
  }
  if (p.includes("code") || p.includes("python")) {
    return `${intro}\n\n\`\`\`ts\n// Minimal streaming client\nfor await (const chunk of stream(input)) {\n  process.stdout.write(chunk.delta);\n}\n\`\`\`\n\nThis pattern also handles stop signals cleanly.`;
  }
  return `${intro}\n\n**Answer**\n\nYour sources point to a balanced, hybrid approach. Combine BM25 for high recall with a dense encoder for precision; reference chunk metadata in every citation; and surface stream progress in the chat UI for trust.`;
}

export async function streamAssistantReply(
  input: SendMessageInput,
  onDelta: (delta: { delta: string; done: boolean; citations?: MockCitation[] }) => void,
  signal?: { aborted: boolean }
): Promise<void> {
  const conv = mockConversations.find((c) => c.id === input.conversationId);
  if (!conv) throw new Error("Conversation not found");
  const full = buildAssistantReply(input.content);
  let buffer = "";
  const tokens = full.match(/\S+\s*|\s+/g) ?? [];
  for (const token of tokens) {
    if (signal?.aborted) break;
    await delay(20, 70);
    buffer += token;
    onDelta({ delta: token, done: false });
  }
  if (signal?.aborted) {
    onDelta({ delta: "", done: true });
    return;
  }
  const citations = buildCitations(Math.floor(Math.random() * 1000));
  onDelta({ delta: "", done: true, citations });
  await addAssistantMessage(input.conversationId, buffer, citations, input.model);
}
