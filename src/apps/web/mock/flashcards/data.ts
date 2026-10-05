import { faker, id, isoDate, isoFuture, pick, pickMany } from "../seed";
import { mockCollections } from "../collections/data";

export interface MockFlashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  hint?: string;
  order: number;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  createdAt: string;
}

export interface MockFlashcardDeck {
  id: string;
  name: string;
  description?: string;
  subjectId: string;
  subjectName: string;
  cardCount: number;
  masteredCount: number;
  dueToday: number;
  lastStudied?: string;
  createdAt: string;
  updatedAt: string;
}

const deckTemplates = [
  { name: "Core Vocabulary", description: "Essential terms and definitions" },
  { name: "Key Concepts", description: "Fundamental ideas and principles" },
  { name: "Quick Review", description: "Rapid-fire recall practice" },
];

const cardTopics = [
  {
    front: "What is retrieval-augmented generation (RAG)?",
    back: "A technique that combines retrieval from a knowledge base with a large language model to generate grounded, accurate responses.",
    hint: "Combines retrieval + generation",
  },
  {
    front: "What is the difference between dense and sparse retrieval?",
    back: "Dense uses neural embeddings (semantic similarity); sparse uses lexical matching like BM25 (keyword overlap).",
    hint: "Neural vs. keyword-based",
  },
  {
    front: "What is the SM-2 spaced repetition algorithm?",
    back: "An algorithm that schedules reviews based on ease factor and interval. Rating difficulty adjusts the next review date exponentially.",
    hint: "Ease factor × interval",
  },
  {
    front: "What is reciprocal rank fusion (RRF)?",
    back: "A technique to combine multiple retrieval results by ranking. Score = 1 / (k + rank), summed across rankers. k is typically 60.",
    hint: "Combines multiple rankers",
  },
  {
    front: "What is a cross-encoder in retrieval?",
    back: "A model that jointly encodes query and document together, producing a relevance score. Higher quality than bi-encoders but slower.",
    hint: "Joint query-document encoding",
  },
  {
    front: "What is late chunking?",
    back: "Encoding sentences independently then averaging embeddings per chunk, preserving sentence-level context within larger chunks.",
    hint: "Preserves sentence structure",
  },
  {
    front: "What is NEFTune noisy embedding fine-tuning?",
    back: "Adding random noise to embeddings during instruction fine-tuning, which prevents the model from overfitting to precise embedding positions.",
    hint: "Noise during embedding training",
  },
  {
    front: "What is DoRA (Weight-Decomposed LoRA)?",
    back: "Decomposes LoRA updates into magnitude and direction components, enabling more efficient fine-tuning with fewer parameters.",
    hint: "Magnitude + direction decomposition",
  },
  {
    front: "What is RAGAS evaluation?",
    back: "Reference-free RAG evaluation using LLM judges for faithfulness, answer relevance, and context relevance metrics.",
    hint: "LLM-based reference-free metrics",
  },
  {
    front: "What is幻觉 (hallucination) in LLM outputs?",
    back: "Confident responses that are factually incorrect or ungrounded. In RAG, caused by retrieval failures or model overconfidence.",
    hint: "Groundedness failures",
  },
  {
    front: "What is context compression in RAG?",
    back: "Reducing retrieved context to only the most relevant passages before generation, saving tokens and improving signal.",
    hint: "Reduce before generation",
  },
  {
    front: "What is parent document retrieval?",
    back: "Retrieving larger parent chunks to ensure full context, then referencing child chunks for precise citations.",
    hint: "Large context + precise citation",
  },
  {
    front: "What is multi-vector retrieval?",
    back: "Representing documents with multiple vectors (e.g., one per sentence) allowing fine-grained retrieval and precise citation.",
    hint: "Multiple vectors per document",
  },
  {
    front: "What is self-RAG?",
    back: "A method where the model generates special tokens to critique its own retrieval and generation, enabling adaptive retrieval.",
    hint: "Self-critique during generation",
  },
  {
    front: "What is hyperparameter-efficient fine-tuning?",
    back: "Fine-tuning only a small subset of parameters (LoRA adapters, prefix tokens, etc.) instead of full model weights.",
    hint: "Only updating small portion",
  },
];

export const mockFlashcardDecks: MockFlashcardDeck[] = [];
export const mockFlashcards: MockFlashcard[] = [];

mockCollections.forEach((col, colIdx) => {
  const deckCount = 2 + Math.floor(Math.random() * 2);
  for (let d = 0; d < deckCount; d++) {
    const template = deckTemplates[d % deckTemplates.length];
    const deckId = `deck_${colIdx + 1}_${d + 1}`;
    const cardsPerDeck = 10 + Math.floor(Math.random() * 15);
    const mastered = Math.floor(cardsPerDeck * (0.2 + Math.random() * 0.3));

    mockFlashcardDecks.push({
      id: deckId,
      name: `${col.name}: ${template.name}`,
      description: template.description,
      subjectId: col.id,
      subjectName: col.name,
      cardCount: cardsPerDeck,
      masteredCount: mastered,
      dueToday: Math.floor(cardsPerDeck * 0.15),
      lastStudied: faker.datatype.boolean() ? isoDate(1) : isoDate(3),
      createdAt: isoDate(60),
      updatedAt: isoDate(7),
    });

    for (let c = 0; c < cardsPerDeck; c++) {
      const topic = cardTopics[c % cardTopics.length];
      const easeFactor = 2.1 + Math.random() * 0.8;
      const interval = 1 + Math.floor(Math.random() * 14);
      const dueDays = Math.floor(Math.random() * 5);

      mockFlashcards.push({
        id: id("card"),
        deckId,
        front: topic.front,
        back: topic.back,
        hint: topic.hint,
        order: c + 1,
        easeFactor,
        interval,
        repetitions: Math.floor(Math.random() * 3),
        nextReview: dueDays === 0 ? new Date().toISOString() : isoFuture(dueDays),
        createdAt: isoDate(60 - c),
      });
    }
  }
});

export function getMockDeck(id: string): MockFlashcardDeck | undefined {
  return mockFlashcardDecks.find((d) => d.id === id);
}

export function getMockDeckCards(deckId: string): MockFlashcard[] {
  return mockFlashcards.filter((c) => c.deckId === deckId).sort((a, b) => a.order - b.order);
}

export function getDueCards(deckId?: string): MockFlashcard[] {
  const now = new Date().toISOString();
  return mockFlashcards
    .filter((c) => (deckId ? c.deckId === deckId : true) && c.nextReview <= now)
    .sort((a, b) => a.nextReview.localeCompare(b.nextReview));
}