import { faker, id, isoDate, pick } from "../seed";
import { mockUsers } from "../users/data";

export interface MockAdminUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: "admin" | "member" | "viewer";
  status: "active" | "invited" | "suspended";
  suspended: boolean;
  lastActiveAt?: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockAdminRole {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  builtin: boolean;
}

export interface MockAdminPermission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface MockQueue {
  id: string;
  name: string;
  type: "documents" | "training" | "embeddings" | "indexing" | "system";
  active: number;
  waiting: number;
  completed: number;
  failed: number;
  workers: number;
  lagSeconds: number;
  throughputPerMin: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockWorker {
  id: string;
  hostname: string;
  status: "idle" | "busy" | "offline" | "error";
  cpu: number;
  memory: number;
  gpu?: number;
  jobs: string[];
  currentJobId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockLogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  service: string;
  message: string;
  traceId?: string;
}

export interface MockAIService {
  id: string;
  name: string;
  provider: string;
  model: string;
  health: "online" | "degraded" | "offline";
  p50LatencyMs: number;
  p95LatencyMs: number;
  qps: number;
  tokensPerSecond: number;
  errorRate: number;
  createdAt: string;
  updatedAt: string;
}

const permissionsCatalog = [
  { id: "documents.read", name: "Read documents", category: "Documents" },
  { id: "documents.write", name: "Write documents", category: "Documents" },
  { id: "documents.delete", name: "Delete documents", category: "Documents" },
  { id: "collections.write", name: "Edit collections", category: "Collections" },
  { id: "projects.write", name: "Edit projects", category: "Projects" },
  { id: "chat.send", name: "Send chat messages", category: "Chat" },
  { id: "training.run", name: "Run training jobs", category: "Training" },
  { id: "models.manage", name: "Manage models", category: "Models" },
  { id: "admin.access", name: "Access admin", category: "Admin" },
];

export const mockAdminUsers: MockAdminUser[] = mockUsers.map((u, i) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  avatarUrl: u.avatarUrl,
  role: u.role,
  status: i === mockUsers.length - 1 ? "invited" : "active",
  suspended: false,
  lastActiveAt: isoDate(0),
  twoFactorEnabled: i === 0,
  createdAt: u.joinedAt,
  updatedAt: isoDate(0),
}));

export const mockAdminRoles: MockAdminRole[] = [
  {
    id: "role_admin",
    name: "Admin",
    description: "Full access to every subsystem.",
    userCount: 2,
    permissions: permissionsCatalog.map((p) => p.id),
    builtin: true,
  },
  {
    id: "role_member",
    name: "Member",
    description: "Standard contributor. Cannot manage roles.",
    userCount: mockUsers.length - 3,
    permissions: permissionsCatalog.filter((p) => p.id !== "admin.access").map((p) => p.id),
    builtin: true,
  },
  {
    id: "role_viewer",
    name: "Viewer",
    description: "Read-only access to public resources.",
    userCount: 1,
    permissions: ["documents.read"],
    builtin: true,
  },
];

export const mockAdminPermissions = permissionsCatalog;

const queueTypes: MockQueue["type"][] = ["documents", "training", "embeddings", "indexing", "system"];

export const mockQueues: MockQueue[] = queueTypes.map((type, i) => ({
  id: `q_${type}_${i}`,
  name: `${type}-queue`,
  type,
  active: faker.number.int({ min: 0, max: 30 }),
  waiting: faker.number.int({ min: 0, max: 240 }),
  completed: faker.number.int({ min: 1200, max: 120_000 }),
  failed: faker.number.int({ min: 0, max: 80 }),
  workers: faker.number.int({ min: 1, max: 6 }),
  lagSeconds: faker.number.int({ min: 0, max: 240 }),
  throughputPerMin: faker.number.int({ min: 12, max: 480 }),
  createdAt: isoDate(40),
  updatedAt: isoDate(0),
}));

export const mockWorkers: MockWorker[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `wk_${i + 1}`,
  hostname: `worker-${faker.string.alphanumeric(4).toLowerCase()}`,
  status: pick(["idle", "busy", "offline", "error"]) as MockWorker["status"],
  cpu: faker.number.int({ min: 4, max: 96 }),
  memory: faker.number.int({ min: 10, max: 92 }),
  gpu: faker.number.int({ min: 0, max: 96 }),
  jobs: faker.number.int({ min: 0, max: 8 }) > 4 ? [id("job")] : [],
  currentJobId: undefined,
  createdAt: isoDate(40),
  updatedAt: isoDate(0),
}));

export const mockLogs: MockLogEntry[] = Array.from({ length: 80 }).map((_, i) => ({
  id: `log_${i}`,
  timestamp: isoDate(0, i * 12),
  level: pick(["info", "info", "info", "warn", "warn", "error", "debug"]) as MockLogEntry["level"],
  service: pick(["api", "worker", "scheduler", "embedding", "retrieval", "auth"]),
  message: pick([
    "Job started — job_001",
    "Job completed — job_001",
    "Queue lag exceeded 60s",
    "Embedding service returned 503",
    "Auth refresh token issued",
    "Cache invalidation: collections",
    "Worker reconnected",
    "Healthcheck OK",
  ]),
}));

export const mockAIServices: MockAIService[] = [
  {
    id: "ai_llama",
    name: "Llama 3.1 8B (Local)",
    provider: "ollama",
    model: "llama-3.1-8b-instruct",
    health: "online",
    p50LatencyMs: 320,
    p95LatencyMs: 1200,
    qps: 12.4,
    tokensPerSecond: 480,
    errorRate: 0.01,
    createdAt: isoDate(40),
    updatedAt: isoDate(0),
  },
  {
    id: "ai_mistral",
    name: "Mistral 7B (Local)",
    provider: "ollama",
    model: "mistral-7b-instruct",
    health: "online",
    p50LatencyMs: 280,
    p95LatencyMs: 980,
    qps: 14.2,
    tokensPerSecond: 520,
    errorRate: 0.005,
    createdAt: isoDate(40),
    updatedAt: isoDate(0),
  },
  {
    id: "ai_embed",
    name: "BGE-M3 Embeddings",
    provider: "tei",
    model: "bge-m3",
    health: "degraded",
    p50LatencyMs: 80,
    p95LatencyMs: 360,
    qps: 124.8,
    tokensPerSecond: 5400,
    errorRate: 0.04,
    createdAt: isoDate(40),
    updatedAt: isoDate(0),
  },
  {
    id: "ai_rerank",
    name: "Reranker (Local)",
    provider: "tei",
    model: "bge-reranker-v2",
    health: "online",
    p50LatencyMs: 110,
    p95LatencyMs: 410,
    qps: 56.4,
    tokensPerSecond: 1800,
    errorRate: 0.01,
    createdAt: isoDate(40),
    updatedAt: isoDate(0),
  },
];
