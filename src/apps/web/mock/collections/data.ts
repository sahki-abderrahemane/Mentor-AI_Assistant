import { faker, id, isoDate, pick } from "../seed";
import { mockProjects } from "../projects/data";
import { mockUsers } from "../users/data";

export type MockCollectionStatus = "ready" | "indexing" | "failed" | "paused";

export interface MockCollection {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  description: string;
  icon: string;
  ownerId: string;
  documentCount: number;
  totalSize: number;
  vectorIndexed: number;
  citationCount: number;
  status: MockCollectionStatus;
  starred: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const collectionNames = [
  "Attention Papers",
  "RAG Survey 2026",
  "Embeddings Literature",
  "Fine-tuning Datasets",
  "Knowledge Objects",
  "Eval Benchmarks",
  "Dataset Library",
  "Prompt Library",
  "Conversation Archive",
  "Multilingual Corpora",
];

const icons = ["Layers", "Library", "Folder", "BookMarked", "Files", "Inbox"];

function makeCollectionForProject(projectId: string, name: string, index: number): MockCollection {
  const owner = mockUsers[0]!;
  const isReady = Math.random() > 0.1;
  const isIndexed = Math.random() > 0.05;
  return {
    id: `col_${projectId.slice(4)}-${index}`,
    projectId,
    projectName: "",
    name,
    description: faker.lorem.sentence({ min: 6, max: 14 }),
    icon: pick(icons),
    ownerId: owner.id,
    documentCount: faker.number.int({ min: 4, max: 24 }),
    totalSize: faker.number.int({ min: 4_000_000, max: 240_000_000 }),
    vectorIndexed: isIndexed ? faker.number.int({ min: 1, max: 8000 }) : 0,
    citationCount: faker.number.int({ min: 0, max: 240 }),
    status: isReady
      ? isIndexed
        ? "ready"
        : "indexing"
      : (pick(["paused", "failed"]) as MockCollectionStatus),
    starred: Math.random() > 0.7,
    tags: pick([
      ["research"],
      ["internal"],
      ["public"],
      ["research", "priority"],
      ["research", "llm"],
      ["dataset"],
    ]),
    createdAt: isoDate(40 + index),
    updatedAt: isoDate(faker.number.int({ min: 0, max: 10 })),
  };
}

export const mockCollections: MockCollection[] = [];

mockProjects.forEach((project) => {
  const count = faker.number.int({ min: 2, max: 4 });
  for (let i = 0; i < count; i++) {
    const name = `${pick(collectionNames)} · ${project.name.split(" ")[0]}`;
    const collection = makeCollectionForProject(project.id, name, mockCollections.length);
    collection.projectName = project.name;
    mockCollections.push(collection);
  }
});

export function getMockCollection(cId: string): MockCollection | undefined {
  return mockCollections.find((c) => c.id === cId);
}
