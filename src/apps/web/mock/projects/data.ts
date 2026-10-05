import { faker, id, isoDate, pick, pickMany } from "../seed";
import { mockUsers } from "../users/data";

export interface MockProject {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  ownerId: string;
  ownerName: string;
  memberIds: string[];
  collectionCount: number;
  documentCount: number;
  conversationCount: number;
  starred: boolean;
  archived: boolean;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

const colors = [
  "#7c3aed",
  "#2563eb",
  "#0891b2",
  "#059669",
  "#d97706",
  "#dc2626",
  "#db2777",
  "#65a30d",
];

const icons = ["Brain", "Beaker", "Atom", "Microscope", "BookOpen", "Sparkles", "Wand2", "Stethoscope"];

const projectTopics = [
  { name: "LLM Foundations", tags: ["llms", "research"] },
  { name: "Retrieval Research", tags: ["rag", "retrieval"] },
  { name: "Fine-tuning Lab", tags: ["finetuning", "experiments"] },
  { name: "Document Processing", tags: ["nlp", "pipelines"] },
  { name: "Evaluation Suite", tags: ["evaluation", "metrics"] },
  { name: "Knowledge Graphs", tags: ["kg", "graph"] },
  { name: "Multilingual Models", tags: ["i18n", "llms"] },
  { name: "Alignment & Safety", tags: ["safety", "alignment"] },
  { name: "Speech & Audio", tags: ["speech", "audio"] },
  { name: "Computer Vision", tags: ["cv", "vision"] },
];

export const mockProjects: MockProject[] = projectTopics.map((topic, i) => {
  const owner = pick(mockUsers);
  const memberCount = faker.number.int({ min: 1, max: 3 });
  const members = pickMany(mockUsers, memberCount).filter((m) => m.id !== owner.id);
  return {
    id: `prj_${String(i + 1).padStart(2, "0")}`,
    name: topic.name,
    description: faker.lorem.sentence({ min: 8, max: 16 }),
    color: pick(colors),
    icon: pick(icons),
    ownerId: owner.id,
    ownerName: owner.name,
    memberIds: members.map((m) => m.id),
    collectionCount: faker.number.int({ min: 2, max: 5 }),
    documentCount: faker.number.int({ min: 6, max: 22 }),
    conversationCount: faker.number.int({ min: 4, max: 30 }),
    starred: i < 3,
    archived: false,
    lastActivityAt: isoDate(faker.number.int({ min: 0, max: 5 })),
    createdAt: isoDate(40 + i * 5),
    updatedAt: isoDate(faker.number.int({ min: 0, max: 5 })),
    tags: topic.tags,
  };
});

export function getMockProject(id: string): MockProject | undefined {
  return mockProjects.find((p) => p.id === id);
}
