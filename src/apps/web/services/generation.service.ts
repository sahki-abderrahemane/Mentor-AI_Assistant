import { getApiClient } from "@/lib/api";

export type GenerationQuestionType = "multiple_choice" | "true_false" | "short_answer";

export interface GenerateQuizInput {
  documentId?: string;
  collectionId?: string;
  title?: string;
  questionCount?: number;
  types?: GenerationQuestionType[];
}

export interface GenerateFlashcardsInput {
  documentId?: string;
  collectionId?: string;
  name?: string;
  cardCount?: number;
}

export interface GenerateStudyGuideInput {
  documentId?: string;
  collectionId?: string;
  title?: string;
}

export interface GeneratedQuizQuestion {
  id: string;
  type: "multiple_choice" | "true_false" | "short_answer";
  text: string;
  options?: Array<{ id: string; text: string; isCorrect: boolean }>;
  correctAnswer?: string;
  explanation?: string;
  points: number;
  order: number;
}

export interface GeneratedQuiz {
  id: string;
  title: string;
  description?: string;
  questionCount: number;
  questions: GeneratedQuizQuestion[];
  createdAt: string;
}

export interface GeneratedFlashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  order: number;
}

export interface GeneratedFlashcardDeck {
  id: string;
  name: string;
  description?: string;
  cardCount: number;
  cards: GeneratedFlashcard[];
  createdAt: string;
}

export interface GeneratedStudyGuideSection {
  id: string;
  type: "summary" | "key_concepts" | "faq" | "glossary" | "practice";
  title: string;
  content: string;
  order: number;
}

export interface GeneratedStudyGuide {
  id: string;
  title: string;
  description?: string;
  sections: GeneratedStudyGuideSection[];
  createdAt: string;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let mockIdCounter = 0;
function nextMockId(prefix: string) {
  mockIdCounter += 1;
  return `${prefix}-gen-${Date.now()}-${mockIdCounter}`;
}

export const generationService = {
  generateQuiz: (input: GenerateQuizInput): Promise<GeneratedQuiz> => {
    const c = getApiClient();
    if (c.kind === "mock") {
      return delay(1200).then(() => {
        const count = input.questionCount ?? 5;
        const types = input.types ?? ["multiple_choice"];
        const questions = Array.from({ length: count }, (_, i) => {
          const type = types[i % types.length];
          const base = {
            id: nextMockId("q"),
            type,
            text: `Sample ${type.replace("_", " ")} question ${i + 1}?`,
            explanation: "Generated explanation for this question.",
            points: 1,
            order: i + 1,
          };
          if (type === "multiple_choice") {
            return {
              ...base,
              options: [
                { id: nextMockId("o"), text: "Correct answer", isCorrect: true },
                { id: nextMockId("o"), text: "Distractor A", isCorrect: false },
                { id: nextMockId("o"), text: "Distractor B", isCorrect: false },
                { id: nextMockId("o"), text: "Distractor C", isCorrect: false },
              ],
              correctAnswer: "Correct answer",
            };
          }
          if (type === "true_false") {
            return {
              ...base,
              options: [
                { id: nextMockId("o"), text: "True", isCorrect: true },
                { id: nextMockId("o"), text: "False", isCorrect: false },
              ],
              correctAnswer: "True",
            };
          }
          return { ...base, correctAnswer: "Sample short answer" };
        });
        return {
          id: nextMockId("quiz"),
          title: input.title ?? "AI-generated quiz",
          description: "Quiz generated from your sources.",
          questionCount: count,
          questions,
          createdAt: new Date().toISOString(),
        };
      });
    }
    return c.real.post("/generation/quiz", input).then((r) => r.data);
  },

  generateFlashcards: (input: GenerateFlashcardsInput): Promise<GeneratedFlashcardDeck> => {
    const c = getApiClient();
    if (c.kind === "mock") {
      return delay(1200).then(() => {
        const deckId = nextMockId("deck");
        const count = input.cardCount ?? 10;
        const cards = Array.from({ length: count }, (_, i) => ({
          id: nextMockId("fc"),
          deckId,
          front: `Sample term ${i + 1}`,
          back: `Sample definition ${i + 1} generated from your source material.`,
          order: i + 1,
        }));
        return {
          id: deckId,
          name: input.name ?? "AI-generated flashcards",
          description: "Flashcards generated from your sources.",
          cardCount: count,
          cards,
          createdAt: new Date().toISOString(),
        };
      });
    }
    return c.real.post("/generation/flashcards", input).then((r) => r.data);
  },

  generateStudyGuide: (input: GenerateStudyGuideInput): Promise<GeneratedStudyGuide> => {
    const c = getApiClient();
    if (c.kind === "mock") {
      return delay(1200).then(() => ({
        id: nextMockId("guide"),
        title: input.title ?? "AI-generated study guide",
        description: "Study guide generated from your sources.",
        sections: [
          {
            id: nextMockId("sec"),
            type: "summary",
            title: "Summary",
            content: "A concise overview of the key ideas in the selected source.",
            order: 1,
          },
          {
            id: nextMockId("sec"),
            type: "key_concepts",
            title: "Key concepts",
            content: "- Concept one\n- Concept two\n- Concept three",
            order: 2,
          },
        ] satisfies GeneratedStudyGuideSection[],
        createdAt: new Date().toISOString(),
      }));
    }
    return c.real.post("/generation/study-guide", input).then((r) => r.data);
  },
};
