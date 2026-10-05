import { faker, id, isoDate, pick, pickMany } from "../seed";
import { mockUsers } from "../users/data";
import { mockCollections } from "../collections/data";
import { mockDocuments } from "../documents/data";

export interface MockCitation {
  id: string;
  documentId: string;
  documentTitle: string;
  collectionId?: string;
  collectionName?: string;
  page?: number;
  section?: string;
  snippet: string;
  score: number;
}

export interface MockMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  citations?: MockCitation[];
  createdAt: string;
  meta?: {
    inputTokens?: number;
    outputTokens?: number;
    latencyMs?: number;
  };
}

export interface MockConversation {
  id: string;
  title: string;
  folder?: string;
  userId: string;
  collectionIds: string[];
  projectId?: string;
  messageCount: number;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  model: string;
  pinned: boolean;
  archived: boolean;
  starred: boolean;
  shared: boolean;
  messages: MockMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface MockConversationFolder {
  id: string;
  name: string;
  conversationIds: string[];
}

const models = [
  { id: "llama-3.1-8b-instruct", name: "Llama 3.1 8B (Local)" },
  { id: "mistral-7b-instruct", name: "Mistral 7B (Local)" },
  { id: "qwen-2.5-7b", name: "Qwen 2.5 7B (Local)" },
  { id: "phi-3-mini", name: "Phi-3 Mini (Local)" },
];

const conversationSeeds = [
  {
    title: "Compare RAG vs. long context",
    folder: "Research",
    messages: [
      "How does RAG compare to simply stuffing a long context window with everything?",
      "Retrieval-augmented generation boundaries retrieval to the most relevant passages, reducing latency and cost while grounding the model on verifiable sources. Long context windows attempt to fit it all in attention; this works only up to a point—distention, lost-in-the-middle effects, and quadratic attention cost all kick in. The best modern systems are hybrids: long-context with recency bias plus retrieval for evidence.",
    ],
  },
  {
    title: "Fine-tune Llama-3.1-8B on QLoRA",
    folder: "Training",
    messages: [
      "What rank and alpha should I pick for a QLoRA run on 8B?",
      "Start with rank 16 and alpha 32 for most adaptation tasks. If you need more capacity (instruction-following, complex tool use), rank 32 with alpha 64 is the next step. Beyond rank 64 you usually hit diminishing returns without additional regularization. Always enable NEFTune for noisy embeddings and consider DoRA if you're targeting reasoning tasks.",
    ],
  },
  {
    title: "Build a hybrid retriever",
    folder: "Engineering",
    messages: [
      "Walk me through a production-ready hybrid retriever.",
      "A clean pattern is to combine BM25 (lexical recall) with a dense encoder like BGE-M3 (semantic recall) using reciprocal rank fusion. Re-rank the top-50 with a cross-encoder (e.g., Cohere Rerank v3). Stage citations so the LLM sees them as evidence, not as system instructions. Use late chunking for long documents to avoid mid-sentence splits. Cache embeddings aggressively — most queries hit 60–80% warm recall within 24 hours.",
    ],
  },
  {
    title: "Evaluation harness plan",
    folder: "Evaluation",
    messages: [
      "How should I structure an evaluation harness for a RAG app?",
      "Build three layers: (1) retrieval quality — recall@k, MRR, nDCG against a held-out set; (2) answer quality — LLM-as-judge plus human spot-checks on a smaller subset; (3) grounding — assert every claim has a citation and run a citation-precision audit. Track regressions across prompt versions, model swaps, and index rebuilds.",
    ],
  },
  {
    title: "Knowledge object schemas",
    folder: "Architecture",
    messages: [
      "Should knowledge objects carry parent-child structure?",
      "Yes — and the schema should reflect it. Use a `parent_id` pointer plus `depth`, plus `section` and `subsection` strings inferred from heading detection. This lets you reconstruct document hierarchy for the UI while keeping retrieval flat over `text`. Carry forward `page_start`/`page_end` so citations can be exact, and hash the text to detect drift across reindexes.",
    ],
  },
  {
    title: "Streaming UX recommendations",
    folder: "Product",
    messages: [
      "What UX patterns work best for streaming chat with citations?",
      "Three patterns work well together: (1) render the assistant message token-by-token without backspacing; (2) reveal citations incrementally as the model finishes stream segments; (3) let users 'pin' a source to the right panel and continue asking from there. Stop and regenerate must always be one click away. Avoid modal interruptions mid-stream.",
    ],
  },
];

export function maybeCitations(seed: number, prefix: string): MockCitation[] {
  const pool = mockDocuments.filter((d) => d.status === "ready");
  const count = 1 + (seed % 3);
  return Array.from({ length: Math.min(count, pool.length) })
    .map((_, i) => pool[(seed * 7 + i * 11) % pool.length])
    .filter(Boolean)
    .map((doc, i) => ({
      id: id(`cit_${prefix}`),
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

function buildConversationFromSeed(
  seed: typeof conversationSeeds[number],
  index: number
): MockConversation {
  const convId = `conv_${String(index + 1).padStart(3, "0")}`;
  const coll =
    mockCollections[index % mockCollections.length] ??
    mockCollections[0];
  const model = pick(models);
  const created = isoDate(faker.number.int({ min: 1, max: 30 }));
  const messages: MockMessage[] = seed.messages.map((content, idx) => {
    const isUser = idx % 2 === 0;
    return {
      id: id("msg"),
      conversationId: convId,
      role: isUser ? "user" : "assistant",
      content,
      model: isUser ? undefined : model.id,
      citations: !isUser ? maybeCitations(index + idx, convId) : undefined,
      createdAt: isoDate(faker.number.int({ min: 0, max: 15 }), idx * 12),
      meta: !isUser
        ? {
            inputTokens: faker.number.int({ min: 120, max: 600 }),
            outputTokens: faker.number.int({ min: 80, max: 480 }),
            latencyMs: faker.number.int({ min: 320, max: 1800 }),
          }
        : undefined,
    };
  });
  return {
    id: convId,
    title: seed.title,
    folder: seed.folder,
    userId: mockUsers[0]!.id,
    collectionIds: coll ? [coll.id] : [],
    projectId: coll?.projectId,
    messageCount: messages.length,
    lastMessagePreview: messages[messages.length - 1]!.content.slice(0, 140),
    lastMessageAt: messages[messages.length - 1]!.createdAt,
    model: model.id,
    pinned: index < 2,
    archived: false,
    starred: Math.random() > 0.7,
    shared: Math.random() > 0.85,
    messages,
    createdAt: created,
    updatedAt: messages[messages.length - 1]!.createdAt,
  };
}

export const mockConversations: MockConversation[] = conversationSeeds.map((s, i) =>
  buildConversationFromSeed(s, i)
);

// Add additional conversations to reach ~40
while (mockConversations.length < 40) {
  const seed = pick(conversationSeeds);
  mockConversations.push(buildConversationFromSeed(seed, mockConversations.length));
}

export const mockConversationFolders: MockConversationFolder[] = Array.from(
  new Set(mockConversations.map((c) => c.folder ?? "Uncategorized"))
)
  .map((name, i) => ({
    id: `fld_${i}`,
    name,
    conversationIds: mockConversations
      .filter((c) => (c.folder ?? "Uncategorized") === name)
      .map((c) => c.id),
  }));

export function getMockConversation(convId: string): MockConversation | undefined {
  return mockConversations.find((c) => c.id === convId);
}

export function getMockChatModel(id: string) {
  return models.find((m) => m.id === id);
}

export const mockChatModels = models.map((m) => ({
  id: m.id,
  name: m.name,
  provider: "mentorai",
  description: "Local model. Tuned for chat and retrieval.",
  contextWindow: 8192,
  enabled: true,
}));

void pickMany;
