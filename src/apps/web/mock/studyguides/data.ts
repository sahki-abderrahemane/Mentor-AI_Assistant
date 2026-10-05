import { faker, id, isoDate, pick } from "../seed";
import { mockCollections } from "../collections/data";

export interface MockStudyGuide {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  description?: string;
  sourceIds: string[];
  sections: MockStudyGuideSection[];
  createdAt: string;
  updatedAt: string;
}

export interface MockStudyGuideSection {
  id: string;
  type: "summary" | "key_concepts" | "faq" | "glossary" | "practice";
  title: string;
  content: string;
  order: number;
}

const summaries: Record<string, string> = {
  default: `This subject covers fundamental concepts in modern AI systems, with particular emphasis on retrieval-augmented generation, efficient fine-tuning methods, and evaluation frameworks. The material progresses from foundational principles through advanced techniques used in production systems.

Understanding these topics provides a comprehensive foundation for building, deploying, and evaluating AI-powered applications. Each concept builds on previous ones, creating a cohesive understanding of how components interact in real-world systems.`,
};

const keyConcepts: Record<string, string[]> = {
  default: [
    "Retrieval-augmented generation (RAG) combines external knowledge retrieval with LLM generation for grounded, accurate outputs",
    "Hybrid retrieval using BM25 + dense embeddings provides both precision and recall in search",
    "Spaced repetition (SM-2) optimizes review scheduling based on ease factor and interval",
    "LoRA and QLoRA enable parameter-efficient fine-tuning of large models on consumer hardware",
    "Cross-encoders provide higher quality relevance scoring than bi-encoders at the cost of latency",
    "Late chunking preserves sentence-level context within larger document chunks for better retrieval",
    "Evaluation frameworks like RAGAS enable reference-free assessment of RAG pipeline quality",
    "Hallucination in RAG stems from both retrieval failures and model overconfidence in generated content",
  ],
};

const faqs: Record<string, Array<{ q: string; a: string }>> = {
  default: [
    {
      q: "When should I use RAG vs. fine-tuning?",
      a: "Use RAG when you need up-to-date knowledge, transparent citations, and the ability to swap sources. Use fine-tuning when you need consistent output format, style, or deep domain knowledge that's hard to retrieve accurately.",
    },
    {
      q: "What embedding model should I use for academic text?",
      a: "BGE-M3 currently achieves state-of-the-art on the MTEB benchmark for general text. For domain-specific text, fine-tuned embeddings on domain data typically outperform general models.",
    },
    {
      q: "How do I reduce hallucination in my RAG system?",
      a: "Multi-faceted approach: improve retrieval quality (hybrid search, reranking), add citation verification, use lower temperature for factual queries, implement self-RAG or CRAG for adaptive retrieval.",
    },
    {
      q: "What is the recommended chunk size for document retrieval?",
      a: "512 tokens with 20% overlap is a solid starting point. Smaller chunks (256) work better for precise QA; larger chunks (1024) preserve more context for summarization. Adjust based on your use case.",
    },
    {
      q: "How often should embeddings be refreshed?",
      a: "Refresh when source documents change significantly, when you deploy a new embedding model, or when retrieval quality degrades. Monitor retrieval metrics to determine frequency.",
    },
  ],
};

const glossaries: Record<string, Array<{ term: string; def: string }>> = {
  default: [
    { term: "Bi-encoder", def: "An embedding model that encodes queries and documents independently, producing separate vectors that are compared via cosine similarity." },
    { term: "Cross-encoder", def: "An embedding model that jointly encodes query and document together, producing a single relevance score. Higher quality but cannot pre-compute document embeddings." },
    { term: "Dense retrieval", def: "Uses neural network embeddings to capture semantic meaning. Retrieves based on vector similarity rather than keyword overlap." },
    { term: "Sparse retrieval", def: "Uses traditional IR methods like BM25 that rely on keyword frequency and inverse document frequency." },
    { term: "RAG", def: "Retrieval-Augmented Generation. A framework that retrieves relevant documents to ground LLM generation on factual, up-to-date information." },
    { term: "LoRA", def: "Low-Rank Adaptation. A parameter-efficient fine-tuning technique that learns small rank-decomposed matrices added to frozen model weights." },
    { term: "nDCG@k", def: "Normalized Discounted Cumulative Gain at k. A ranking quality metric that accounts for graded relevance and position in the ranked list." },
    { term: "Hallucination", def: "Confident model output that is factually incorrect, ungrounded, or contradicts the retrieved context." },
    { term: "Re-rank", def: "A second-stage ranking step that uses a more expensive (often cross-encoder) model to refine initial retrieval results." },
    { term: "BM25", def: "Okapi BM25. A probabilistic ranking function used for sparse retrieval based on keyword matching with term frequency saturation." },
  ],
};

function buildSection(
  type: MockStudyGuideSection["type"],
  title: string,
  content: string,
  order: number
): MockStudyGuideSection {
  return {
    id: id(`sg_${type}`),
    type,
    title,
    content,
    order,
  };
}

export const mockStudyGuides: MockStudyGuide[] = [];

mockCollections.forEach((col, colIdx) => {
  const guideId = `sg_${colIdx + 1}`;

  const summaryContent = summaries.default;
  const conceptsContent = keyConcepts.default.map((c) => `- ${c}`).join("\n\n");

  const faqContent = faqs.default
    .map((f) => `**Q: ${f.q}**\n\n${f.a}`)
    .join("\n\n---\n\n");

  const glossaryContent = glossaries.default
    .map((g) => `**${g.term}** — ${g.def}`)
    .join("\n\n");

  mockStudyGuides.push({
    id: guideId,
    title: `Study Guide: ${col.name}`,
    subjectId: col.id,
    subjectName: col.name,
    description: `Comprehensive study guide covering key concepts, FAQs, and practice questions for ${col.name}.`,
    sourceIds: [col.id],
    sections: [
      buildSection("summary", "Summary", summaryContent, 1),
      buildSection("key_concepts", "Key Concepts", conceptsContent, 2),
      buildSection("faq", "Frequently Asked Questions", faqContent, 3),
      buildSection("glossary", "Glossary", glossaryContent, 4),
    ],
    createdAt: isoDate(20 + colIdx * 2),
    updatedAt: isoDate(5 + colIdx),
  });
});

export function getMockStudyGuide(id: string): MockStudyGuide | undefined {
  return mockStudyGuides.find((g) => g.id === id);
}