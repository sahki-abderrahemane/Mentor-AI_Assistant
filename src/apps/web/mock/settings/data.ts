import { delay } from "../seed";
import { mockUsers } from "../users/data";

export interface MockUserSettings {
  appearance: {
    theme: "light" | "dark" | "system";
    density: "comfortable" | "compact";
    accentColor?: "blue" | "violet" | "green" | "amber";
    reduceMotion: boolean;
  };
  language: string;
  notifications: {
    trainingUpdates: boolean;
    documentUpdates: boolean;
    modelUpdates: boolean;
    shareUpdates: boolean;
    systemUpdates: boolean;
    email: boolean;
  };
  privacy: {
    shareUsage: boolean;
    allowAnalytics: boolean;
    allowAIMemory: boolean;
  };
  defaults: {
    defaultModel: string;
    defaultCollectionId?: string;
  };
  permissions: string[];
}

export interface MockApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockIntegration {
  id: string;
  name: string;
  provider: string;
  connected: boolean;
  description: string;
  configFields?: { key: string; label: string; type: string }[];
  createdAt: string;
  updatedAt: string;
}

export const mockUserSettings: MockUserSettings = {
  appearance: {
    theme: "system",
    density: "comfortable",
    accentColor: "violet",
    reduceMotion: false,
  },
  language: "en",
  notifications: {
    trainingUpdates: true,
    documentUpdates: true,
    modelUpdates: true,
    shareUpdates: false,
    systemUpdates: true,
    email: false,
  },
  privacy: {
    shareUsage: true,
    allowAnalytics: true,
    allowAIMemory: false,
  },
  defaults: {
    defaultModel: "llama-3.1-8b-instruct",
  },
  permissions: [
    "documents.read",
    "documents.write",
    "collections.write",
    "projects.write",
    "chat.send",
    "training.run",
    "models.manage",
  ],
};

export const mockApiKeys: MockApiKey[] = Array.from({ length: 3 }).map((_, i) => ({
  id: `key_${i + 1}`,
  name: i === 0 ? "Local dev" : i === 1 ? "Mobile" : "CI",
  prefix: "mentor_" + Math.random().toString(36).slice(2, 10),
  scopes: i === 0 ? ["chat", "search", "documents.read"] : i === 1 ? ["search"] : ["documents.read"],
  lastUsedAt: new Date(Date.now() - i * 86_400_000).toISOString(),
  createdAt: new Date(Date.now() - 30 * 86_400_000).toISOString(),
  updatedAt: new Date(Date.now() - i * 86_400_000).toISOString(),
}));

export const mockIntegrations: MockIntegration[] = [
  {
    id: "int_github",
    name: "GitHub",
    provider: "github",
    connected: true,
    description: "Pull repositories and PRs into collections automatically.",
    createdAt: new Date(Date.now() - 12 * 86_400_000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "int_slack",
    name: "Slack",
    provider: "slack",
    connected: false,
    description: "Forward notifications and answers to a Slack channel.",
    createdAt: new Date(Date.now() - 30 * 86_400_000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "int_zotero",
    name: "Zotero",
    provider: "zotero",
    connected: false,
    description: "Sync references into knowledge graphs.",
    createdAt: new Date(Date.now() - 50 * 86_400_000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

void mockUsers;
void delay;
