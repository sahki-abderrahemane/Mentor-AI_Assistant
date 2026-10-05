import type { AuditFields } from "./api.types";

export type TrainingStatus =
  | "queued"
  | "preparing"
  | "running"
  | "evaluating"
  | "completed"
  | "failed"
  | "cancelled"
  | "paused";

export type TrainingMethod = "qlora" | "lora" | "full";

export interface TrainingHyperparams {
  learningRate: number;
  epochs: number;
  batchSize: number;
  gradientAccumulation: number;
  warmupRatio: number;
  weightDecay: number;
  maxSeqLength: number;
  loraRank: number;
  loraAlpha: number;
  loraDropout: number;
  optimizer: string;
  scheduler: string;
}

export interface TrainingDataset {
  id: string;
  name: string;
  samples: number;
  collectionIds: string[];
  generatedBy?: string;
}

export interface TrainingMetrics {
  step: number;
  loss: number;
  learningRate: number;
  gradNorm?: number;
  tokensPerSecond?: number;
  evalLoss?: number;
  evalPerplexity?: number;
  timestamp: string;
}

export interface TrainingGPU {
  id: number;
  name: string;
  utilization: number;
  memoryUsed: number;
  memoryTotal: number;
  temperatureC: number;
  powerDrawW: number;
}

export interface TrainingEvaluation {
  metric: string;
  score: number;
  baseline?: number;
  delta?: number;
}

export interface TrainingAdapter {
  id: string;
  name: string;
  size: number;
  baseModel: string;
  rank: number;
  alpha: number;
  downloadUrl?: string;
}

export type TrainingJobType = "finetune" | "continued-pretraining" | "instruction-tuning";

export interface TrainingJob extends AuditFields {
  id: string;
  name: string;
  type: TrainingJobType;
  projectId?: string;
  collectionIds: string[];
  baseModel: string;
  dataset: TrainingDataset;
  hyperparams: TrainingHyperparams;
  status: TrainingStatus;
  progress: number;
  currentStep: number;
  totalSteps: number;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  metrics: TrainingMetrics[];
  evaluation: TrainingEvaluation[];
  gpus: TrainingGPU[];
  adapters: TrainingAdapter[];
  logs: TrainingLog[];
  createdBy: string;
  starred: boolean;
}

export interface TrainingLog {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
}

export interface CreateTrainingJobInput {
  name: string;
  type: TrainingJobType;
  projectId?: string;
  collectionIds: string[];
  baseModel: string;
  dataset: { collectionIds: string[]; splitRatio?: number };
  hyperparams?: Partial<TrainingHyperparams>;
}

export interface TrainingFilters {
  status?: TrainingStatus[];
  projectId?: string;
  baseModel?: string;
}
