import { faker, id, isoDate, pick, isoFuture } from "../seed";
import { mockCollections } from "../collections/data";
import { mockUsers } from "../users/data";

export interface MockQuiz {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  questionCount: number;
  timeLimitMinutes?: number;
  passingScore: number;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface MockQuestion {
  id: string;
  quizId: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  text: string;
  options?: Array<{ id: string; text: string; isCorrect: boolean }>;
  correctAnswer?: string;
  explanation?: string;
  points: number;
  order: number;
}

export interface MockQuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  startedAt: string;
  completedAt?: string;
  answers: Array<{ questionId: string; answer: string | string[]; correct: boolean; pointsEarned: number }>;
}

const quizTemplates = [
  {
    title: "Introduction Quiz",
    description: "Test your understanding of core concepts from the introduction section.",
    questions: 5,
  },
  {
    title: "Core Concepts Assessment",
    description: "Multiple choice questions covering the fundamental principles.",
    questions: 8,
  },
  {
    title: "Advanced Topics",
    description: "Challenge yourself with advanced material and edge cases.",
    questions: 6,
  },
  {
    title: "Quick Review",
    description: "Rapid-fire questions to refresh your memory.",
    questions: 4,
  },
  {
    title: "Final Mastery Test",
    description: "Comprehensive assessment covering all material.",
    questions: 10,
  },
];

const questionBanks: Record<string, Array<{ text: string; options?: string[]; correct: string; explanation: string }>> = {
  default: [
    {
      text: "What is the primary purpose of the technique described?",
      options: ["Improve accuracy", "Reduce latency", "Enhance security", "Optimize storage"],
      correct: "Improve accuracy",
      explanation: "The main goal is to improve model accuracy on downstream tasks.",
    },
    {
      text: "Which approach works best for large-scale deployment?",
      options: ["Monolithic architecture", "Microservices", "Serverless", "Edge computing"],
      correct: "Microservices",
      explanation: "Microservices allow independent scaling and resilience.",
    },
    {
      text: "Retrieval-augmented generation combines retrieval with generation.",
      options: ["True", "False"],
      correct: "True",
      explanation: "RAG explicitly uses a retrieval step to ground the generator.",
    },
    {
      text: "What is the recommended batch size for fine-tuning?",
      options: ["1-4", "8-16", "32-64", "128+"],
      correct: "8-16",
      explanation: "Smaller batch sizes with gradient accumulation work well for fine-tuning.",
    },
    {
      text: "Which metric best measures retrieval quality?",
      options: ["Accuracy", "F1 score", "nDCG@k", "BLEU"],
      correct: "nDCG@k",
      explanation: "nDCG@k handles graded relevance and is the standard for retrieval.",
    },
    {
      text: "What is the key advantage of hybrid retrieval?",
      options: ["Lower cost", "Better coverage", "Faster inference", "Simpler pipeline"],
      correct: "Better coverage",
      explanation: "Hybrid retrieval combines semantic and lexical for both precision and recall.",
    },
    {
      text: "Which embedding model provides the best performance on academic text?",
      options: ["BGE-M3", "E5", "GTE", "All perform similarly"],
      correct: "BGE-M3",
      explanation: "BGE-M3 achieves state-of-the-art on the MTEB benchmark.",
    },
    {
      text: "Late chunking preserves document structure better than fixed-size chunks.",
      options: ["True", "False"],
      correct: "True",
      explanation: "Late chunking maintains sentence-level context within each chunk.",
    },
    {
      text: "What causes hallucination in RAG systems?",
      options: [
        "Retrieval failures only",
        "Generation overconfidence",
        "Both retrieval and generation failures",
        "Neither",
      ],
      correct: "Both retrieval and generation failures",
      explanation: "Hallucination stems from both poor retrieval and the model's tendency to fill gaps.",
    },
    {
      text: "The best reranking strategy for production is a cross-encoder.",
      options: ["True", "False"],
      correct: "True",
      explanation: "Cross-encoders provide the highest quality reranking at the cost of latency.",
    },
  ],
};

function buildQuestion(
  quizId: string,
  order: number,
  template: { text: string; options?: string[]; correct: string; explanation: string }
): MockQuestion {
  const qType: "multiple-choice" | "true-false" | "short-answer" = template.options
    ? template.options.length === 2
      ? "true-false"
      : "multiple-choice"
    : "short-answer";

  const question: MockQuestion = {
    id: id("q"),
    quizId,
    type: qType,
    text: template.text,
    explanation: template.explanation,
    points: 1,
    order,
  };

  if (template.options) {
    question.options = template.options.map((opt, i) => ({
      id: `opt_${i}`,
      text: opt,
      isCorrect: opt === template.correct,
    }));
  } else {
    question.correctAnswer = template.correct;
  }

  return question;
}

export const mockQuizzes: MockQuiz[] = [];
export const mockQuestions: MockQuestion[] = [];
export const mockQuizAttempts: MockQuizAttempt[] = [];

mockCollections.forEach((col, colIdx) => {
  quizTemplates.forEach((tmpl) => {
    const quizId = `quiz_${colIdx + 1}_${mockQuizzes.length + 1}`;
    const qCount = Math.min(tmpl.questions, questionBanks.default.length);
    const questions = questionBanks.default.slice(0, qCount);

    mockQuizzes.push({
      id: quizId,
      title: `${col.name}: ${tmpl.title}`,
      description: tmpl.description,
      subjectId: col.id,
      subjectName: col.name,
      questionCount: questions.length,
      timeLimitMinutes: tmpl.questions > 5 ? 15 : 10,
      passingScore: 70,
      status: "published",
      createdAt: isoDate(30 + colIdx * 2),
      updatedAt: isoDate(colIdx),
    });

    questions.forEach((q, i) => {
      mockQuestions.push(buildQuestion(quizId, i + 1, q));
    });
  });
});

mockUsers.forEach((user) => {
  mockQuizzes.slice(0, 6).forEach((quiz, qi) => {
    const attemptId = `att_${user.id}_${qi}`;
    const questions = mockQuestions.filter((q) => q.quizId === quiz.id);
    const score = 40 + Math.floor(Math.random() * 55);
    const totalPoints = questions.length;
    const earned = Math.round((score / 100) * totalPoints);

    mockQuizAttempts.push({
      id: attemptId,
      quizId: quiz.id,
      userId: user.id,
      score: earned,
      totalPoints,
      percentage: score,
      passed: score >= 70,
      timeSpentSeconds: 120 + Math.floor(Math.random() * 600),
      startedAt: isoDate(7 + qi * 2, qi * 3600),
      completedAt: isoDate(7 + qi * 2, qi * 3600 + 300),
      answers: questions.map((q, ai) => ({
        questionId: q.id,
        answer: q.options ? q.options.find((o) => o.isCorrect)?.text ?? "" : q.correctAnswer ?? "",
        correct: ai < earned,
        pointsEarned: ai < earned ? 1 : 0,
      })),
    });
  });
});

export function getMockQuiz(id: string): MockQuiz | undefined {
  return mockQuizzes.find((q) => q.id === id);
}

export function getMockQuizQuestions(quizId: string): MockQuestion[] {
  return mockQuestions.filter((q) => q.quizId === quizId).sort((a, b) => a.order - b.order);
}

export function getMockQuizAttempts(userId: string, quizId?: string): MockQuizAttempt[] {
  return mockQuizAttempts.filter(
    (a) => a.userId === userId && (quizId ? a.quizId === quizId : true)
  );
}