import type { AuditFields } from "./api.types";

export type ModelType = "base" | "instruct" | "embedding" | "reranker";
export type ModelSize = "tiny" | "small" | "medium" | "large" | "xl";
export type ModelStatus = "available" | "installed" | "downloading" | "updating" | "error";

export interface Model extends AuditFields {
  id: string;
  name: string;
  provider: string;
  type: ModelType;
  size: ModelSize;
  description?: string;
  contextWindow?: number;
  parameters: string;
  ramRequirement?: string;
  vramRequirement?: string;
  license?: string;
  tags: string[];
  rating?: number;
  downloads: number;
  pulls: number;
  status: ModelStatus;
  installedAt?: string;
  downloadProgress?: number;
  loaded: boolean;
  default: boolean;
  /** Optional adapter count for installed models */
  adapterCount?: number;
}

export type AdapterType = "lora" | "qlora" | "prefix" | "prompt";

export interface Adapter extends AuditFields {
  id: string;
  name: string;
  type: AdapterType;
  baseModelId: string;
  baseModelName: string;
  rank: number;
  alpha: number;
  size: number;
  downloadUrl?: string;
  description?: string;
  metrics?: {
    loss: number;
    eval: number;
    perplexity?: number;
  };
}

export interface MergedModel extends AuditFields {
  id: string;
  name: string;
  baseModels: string[];
  adapterIds: string[];
  size: number;
  description?: string;
}

export interface DownloadModelInput {
  modelId: string;
  quantization?: string;
}
