import { faker, id, isoDate, pick, pickMany } from "../seed";
import { mockCollections } from "../collections/data";
import { mockProjects } from "../projects/data";
import { mockUsers } from "../users/data";

export type MockDocumentType =
  | "pdf"
  | "docx"
  | "txt"
  | "html"
  | "markdown"
  | "epub"
  | "other";

export type MockDocumentStatus =
  | "uploading"
  | "queued"
  | "processing"
  | "ready"
  | "failed"
  | "archived";

export type MockProcessingStage =
  | "uploaded"
  | "extracting"
  | "cleaning"
  | "structuring"
  | "chunking"
  | "embedding"
  | "indexed"
  | "completed";

export interface MockKnowledgeUnit {
  id: string;
  unitNumber: number;
  text: string;
  section?: string;
  subsection?: string;
  pageStart?: number;
  pageEnd?: number;
  wordCount: number;
  citations: number;
}

export interface MockTimelineEntry {
  stage: MockProcessingStage;
  status: "pending" | "running" | "done" | "failed";
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  message?: string;
}

export interface MockDocument {
  id: string;
  collectionId: string;
  projectId: string;
  title: string;
  fileName: string;
  fileType: MockDocumentType;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl: string;
  status: MockDocumentStatus;
  progress?: number;
  error?: string;
  authors: { name: string; affiliation?: string }[];
  abstract: string;
  tags: string[];
  language: string;
  stats: {
    pages?: number;
    words: number;
    characters: number;
    chunks: number;
    citations: number;
    size: number;
    readingTimeMin: number;
  };
  preview: { text: string; pageCount: number; language?: string };
  knowledgeUnits: MockKnowledgeUnit[];
  timeline: MockTimelineEntry[];
  indexedAt: string;
  starred: boolean;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
}

const paperTopics = [
  "Attention Is All You Need",
  "A Survey on Retrieval-Augmented Generation",
  "LoRA: Low-Rank Adaptation of Large Language Models",
  "QLoRA: Efficient Finetuning of Quantized LLMs",
  "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks",
  "Hierarchical Attention Networks for Document Classification",
  "Dense Passage Retrieval for Open-Domain Question Answering",
  "ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction",
  "Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection",
  "Lost in the Middle: How Language Models Use Long Contexts",
  "Tree of Thoughts: Deliberate Problem Solving with Large Language Models",
  "RAFT: Adapting Language Models to Domain-specific Retrieval",
  "MTEB: Massive Text Embedding Benchmark",
  "HotpotQA: A Dataset for Diverse, Explainable Multi-hop Question Answering",
  "C-Eval: A Multi-Level Multi-Discipline Chinese Evaluation Suite",
  "InstructGPT: Training Language Models to Follow Instructions with Human Feedback",
  "Reinforcement Learning from Human Feedback for LLMs",
  "Emergent Abilities of Large Language Models",
  "LangChain: Building Applications with LLMs through Composability",
  "LLaMA: Open and Efficient Foundation Language Models",
  "Mixture of Experts: A Survey",
  "FlashAttention: Fast and Memory-Efficient Exact Attention",
  "GQA: Training Generalized Multi-Query Transformer Models",
  "RoFormer: Enhanced Transformer with Rotary Position Embedding",
  "LongRoPE: Extending LLM Context Window Beyond 2M Tokens",
  "Multi-Vector Retrieval with Cross-Encoders",
  "Hybrid Search: Combining BM25 and Dense Retrievers",
  "BGE M3: Multi-lingual Multi-functionality Multi-granularity Text Embeddings",
  "Cohere Rerank: Improving Search Relevance with Cross-Encoders",
  "Pinecone Serverless: Vector Database at Scale",
];

const sectionsOfPaper = [
  "Abstract",
  "Introduction",
  "Related Work",
  "Method",
  "Methodology",
  "Approach",
  "Architecture",
  "Experiments",
  "Experimental Setup",
  "Results",
  "Discussion",
  "Limitations",
  "Conclusion",
  "References",
];

function paragraphsFor(title: string, section: string, paragraphs = 3): string {
  return Array.from({ length: paragraphs })
    .map(() => faker.lorem.paragraph({ min: 5, max: 12 }))
    .join("\n\n");
}

function makeKnowledgeUnits(count: number): MockKnowledgeUnit[] {
  return Array.from({ length: count }).map((_, idx) => {
    const section = pick(sectionsOfPaper);
    return {
      id: id("ku"),
      unitNumber: idx + 1,
      text: faker.lorem.paragraphs(2, "\n\n"),
      section,
      subsection: Math.random() > 0.5 ? `${idx + 1}.${Math.floor(Math.random() * 5) + 1}` : undefined,
      pageStart: Math.floor(idx / 2) + 1,
      pageEnd: Math.floor(idx / 2) + 1,
      wordCount: faker.number.int({ min: 80, max: 320 }),
      citations: faker.number.int({ min: 0, max: 8 }),
    };
  });
}

function makeTimeline(docStatus: MockDocumentStatus): MockTimelineEntry[] {
  const stages: MockProcessingStage[] = [
    "uploaded",
    "extracting",
    "cleaning",
    "structuring",
    "chunking",
    "embedding",
    "indexed",
    "completed",
  ];
  const lastIndex = stages.length - 1;
  return stages.map((stage, idx) => {
    let status: MockTimelineEntry["status"];
    if (docStatus === "ready") {
      status = "done";
    } else if (docStatus === "failed") {
      status = idx === Math.min(stages.length - 1, idx) ? "failed" : "done";
    } else if (docStatus === "processing") {
      if (idx < 3) status = "done";
      else if (idx === 3) status = "running";
      else status = "pending";
    } else {
      status = "pending";
    }
    return {
      stage,
      status,
      startedAt: status === "pending" ? undefined : isoDate(idx, idx * 12),
      completedAt: status === "done" ? isoDate(idx, idx * 12 + 6) : undefined,
      durationMs: status === "running" ? undefined : faker.number.int({ min: 800, max: 16_000 }),
      message:
        status === "failed" ? "Stage failed — retrying with fallback parser." : undefined,
    };
  });
}

function makeDocumentForCollection(
  collectionId: string,
  projectId: string,
  idx: number
): MockDocument {
  const owner = mockUsers[0]!;
  const title = paperTopics[idx % paperTopics.length] ?? "Untitled";
  const ext = pick<MockDocumentType>(["pdf", "pdf", "pdf", "docx", "markdown", "html", "txt"]);
  const mimeType =
    ext === "pdf"
      ? "application/pdf"
      : ext === "docx"
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : ext === "markdown"
      ? "text/markdown"
      : ext === "html"
      ? "text/html"
      : "text/plain";
  const size = faker.number.int({ min: 250_000, max: 18_000_000 });
  const pages = faker.number.int({ min: 6, max: 36 });
  const status: MockDocumentStatus = (() => {
    const r = Math.random();
    if (r < 0.78) return "ready";
    if (r < 0.9) return "processing";
    if (r < 0.96) return "queued";
    return "failed";
  })();
  const chunks = faker.number.int({ min: 12, max: 96 });
  const words = chunks * faker.number.int({ min: 200, max: 600 });
  return {
    id: `doc_${idx.toString().padStart(4, "0")}`,
    collectionId,
    projectId,
    title,
    fileName: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${ext}`,
    fileType: ext,
    mimeType,
    size,
    url: "#",
    thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(title)}/240/320`,
    status,
    progress: status === "processing" ? faker.number.int({ min: 12, max: 94 }) : status === "queued" ? 0 : undefined,
    error: status === "failed" ? "Stage 'embedding' exhausted retries." : undefined,
    authors: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }).map(() => ({
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      affiliation: pick([
        "OpenAI",
        "DeepMind",
        "Stanford University",
        "MIT CSAIL",
        "Google Research",
        "Meta AI",
        "University of Toronto",
        "EPFL",
      ]),
    })),
    abstract: faker.lorem.paragraph({ min: 6, max: 12 }),
    tags: pickMany(
      ["llm", "rag", "fine-tuning", "attention", "embedding", "retrieval", "evaluation", "alignment"],
      faker.number.int({ min: 1, max: 3 })
    ),
    language: "en",
    stats: {
      pages,
      words,
      characters: words * 6,
      chunks,
      citations: faker.number.int({ min: 0, max: chunks * 2 }),
      size,
      readingTimeMin: Math.max(1, Math.round(words / 220)),
    },
    preview: {
      text: paragraphsFor(title, "Abstract", 4),
      pageCount: pages,
      language: "en",
    },
    knowledgeUnits: status === "ready" ? makeKnowledgeUnits(chunks) : [],
    timeline: makeTimeline(status),
    indexedAt: status === "ready" ? isoDate(faker.number.int({ min: 0, max: 10 })) : "",
    starred: Math.random() > 0.7,
    uploadedBy: owner.id,
    uploadedByName: owner.name,
    createdAt: isoDate(faker.number.int({ min: 1, max: 60 })),
    updatedAt: isoDate(faker.number.int({ min: 0, max: 5 })),
  };
}

export const mockDocuments: MockDocument[] = [];

let documentCounter = 0;
mockCollections.forEach((collection) => {
  const docsToGenerate = Math.min(8, Math.max(2, collection.documentCount));
  for (let i = 0; i < docsToGenerate; i++) {
    const doc = makeDocumentForCollection(collection.id, collection.projectId, documentCounter++);
    mockDocuments.push(doc);
  }
});

export function getMockDocument(docId: string): MockDocument | undefined {
  return mockDocuments.find((d) => d.id === docId);
}

export function findProjectsForDocuments(): string[] {
  return Array.from(new Set(mockDocuments.map((d) => d.projectId)));
}

void mockProjects; // ensure dependency is referenced for tree-shaking avoidance
