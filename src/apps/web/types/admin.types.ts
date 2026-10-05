import type { AuditFields } from "./api.types";

export type WorkerStatus = "idle" | "busy" | "offline" | "error";

export interface AdminUser extends AuditFields {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "admin" | "member" | "viewer";
  status: "active" | "invited" | "suspended";
  lastActiveAt?: string;
  twoFactorEnabled: boolean;
}

export interface AdminRole {
  id: string;
  name: string;
  description?: string;
  userCount: number;
  permissions: string[];
  builtin: boolean;
}

export interface AdminPermission {
  id: string;
  name: string;
  description?: string;
  category: string;
}

export interface Queue extends AuditFields {
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
}

export interface Worker extends AuditFields {
  id: string;
  hostname: string;
  status: WorkerStatus;
  cpu: number;
  memory: number;
  gpu?: number;
  jobs: string[];
  currentJobId?: string;
}

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  traceId?: string;
}

export type AIServiceHealth = "online" | "degraded" | "offline";

export interface AIService extends AuditFields {
  id: string;
  name: string;
  provider: string;
  model: string;
  health: AIServiceHealth;
  p50LatencyMs?: number;
  p95LatencyMs?: number;
  qps?: number;
  tokensPerSecond?: number;
  errorRate?: number;
}

export interface SystemHealth {
  uptimeSeconds: number;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  activeUsers: number;
  requestsPerMin: number;
  errorsPerMin: number;
}

export interface DashboardStats {
  documents: {
    total: number;
    indexed: number;
    processing: number;
    storage: number;
  };
  conversations: {
    total: number;
    today: number;
    tokensToday: number;
  };
  training: {
    activeJobs: number;
    completedJobs: number;
    adapters: number;
  };
  models: {
    installed: number;
    downloading: number;
    activeModel?: string;
  };
  storage: {
    usedBytes: number;
    totalBytes: number;
    byType: { type: string; bytes: number }[];
  };
  collections: number;
  projects: number;
}
