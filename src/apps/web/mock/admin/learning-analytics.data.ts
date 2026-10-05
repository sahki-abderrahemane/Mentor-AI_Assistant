import { faker, id, isoDate } from "../seed";

export interface MockDailyActiveUser {
  date: string;
  count: number;
  newUsers: number;
}

export interface MockQuizAggregate {
  subjectId: string;
  subjectName: string;
  attempts: number;
  passRate: number;
  avgScore: number;
  trend: "up" | "down" | "stable";
}

export interface MockTopicStruggle {
  topicId: string;
  topicName: string;
  mastery: number;
  attemptCount: number;
  lastAttemptDate: string;
}

export interface MockLearningAnalytics {
  dailyActiveUsers: MockDailyActiveUser[];
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  quizAggregates: MockQuizAggregate[];
  strugglingTopics: MockTopicStruggle[];
  avgMastery: number;
  retentionRate7d: number;
  totalQuizzesTaken: number;
  totalFlashcardsReviewed: number;
  generatedAt: string;
}

const SUBJECTS = [
  "Machine Learning",
  "Deep Learning",
  "Natural Language Processing",
  "Computer Vision",
  "Reinforcement Learning",
  "Data Structures",
  "Algorithms",
  "Linear Algebra",
];

function generateDAU(days: number): MockDailyActiveUser[] {
  const result: MockDailyActiveUser[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    const base = dow === 0 || dow === 6 ? 140 : 310;
    const count = base + faker.number.int({ min: -40, max: 60 });
    result.push({
      date: d.toISOString().slice(0, 10),
      count,
      newUsers: Math.floor(count * (0.08 + faker.number.float({ min: 0, max: 0.06 }))),
    });
  }
  return result;
}

const dauData = generateDAU(30);
const weeklyUsers = dauData.slice(-7).reduce((s, d) => s + d.count, 0);
const monthlyUsers = dauData.reduce((s, d) => s + d.count, 0);

export const mockLearningAnalytics: MockLearningAnalytics = {
  dailyActiveUsers: dauData,
  weeklyActiveUsers: weeklyUsers,
  monthlyActiveUsers: monthlyUsers,
  quizAggregates: SUBJECTS.map((name, i) => {
    const base = 55 + i * 5;
    const rate = Math.min(95, base + faker.number.int({ min: -8, max: 12 }));
    return {
      subjectId: id("subj"),
      subjectName: name,
      attempts: faker.number.int({ min: 20, max: 200 }),
      passRate: rate,
      avgScore: Math.min(98, rate + faker.number.int({ min: 2, max: 10 })),
      trend: (["up", "down", "stable"] as const)[i % 3],
    };
  }),
  strugglingTopics: [
    { topicId: id("top"), topicName: "Backpropagation", mastery: 42, attemptCount: 34, lastAttemptDate: isoDate(1) },
    { topicId: id("top"), topicName: "Transformers & Attention", mastery: 38, attemptCount: 51, lastAttemptDate: isoDate(0) },
    { topicId: id("top"), topicName: "Recurrent Networks (LSTM/GRU)", mastery: 51, attemptCount: 28, lastAttemptDate: isoDate(2) },
    { topicId: id("top"), topicName: "Convolutional Neural Networks", mastery: 63, attemptCount: 19, lastAttemptDate: isoDate(3) },
    { topicId: id("top"), topicName: "Optimization Algorithms (Adam/SGD)", mastery: 58, attemptCount: 23, lastAttemptDate: isoDate(1) },
  ],
  avgMastery: 62,
  retentionRate7d: 74,
  totalQuizzesTaken: faker.number.int({ min: 800, max: 1200 }),
  totalFlashcardsReviewed: faker.number.int({ min: 4000, max: 8000 }),
  generatedAt: isoDate(0),
};