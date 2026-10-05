import { delay, paginate } from "../seed";
import { mockTrainingJobs } from "./data";
import type { MockTrainingJob, MockTrainingStatus } from "./data";

export interface ListTrainingJobsParams {
  page?: number;
  pageSize?: number;
  query?: string;
  status?: MockTrainingStatus | MockTrainingStatus[];
  projectId?: string;
  baseModel?: string;
  starred?: boolean;
}

export async function listTrainingJobs(params: ListTrainingJobsParams = {}) {
  await delay(120, 280);
  let result = [...mockTrainingJobs];
  if (params.projectId) result = result.filter((j) => j.projectId === params.projectId);
  if (params.baseModel) result = result.filter((j) => j.baseModel === params.baseModel);
  if (params.starred !== undefined) result = result.filter((j) => j.starred === params.starred);
  if (params.status) {
    const set = Array.isArray(params.status) ? new Set(params.status) : new Set([params.status]);
    result = result.filter((j) => set.has(j.status));
  }
  if (params.query) {
    const q = params.query.toLowerCase();
    result = result.filter(
      (j) => j.name.toLowerCase().includes(q) || j.baseModel.toLowerCase().includes(q)
    );
  }
  result.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return paginate(result, params.page ?? 1, params.pageSize ?? 20);
}

export async function getTrainingJob(jid: string) {
  await delay(80, 220);
  const job = mockTrainingJobs.find((j) => j.id === jid);
  if (!job) throw new Error("Training job not found");
  return job;
}

export async function cancelTrainingJob(jid: string) {
  await delay(80, 180);
  const idx = mockTrainingJobs.findIndex((j) => j.id === jid);
  if (idx < 0) throw new Error("Training job not found");
  const updated: MockTrainingJob = {
    ...mockTrainingJobs[idx]!,
    status: "cancelled",
    updatedAt: new Date().toISOString(),
  };
  mockTrainingJobs[idx] = updated;
  return updated;
}

export interface CreateTrainingJobInput {
  name?: string;
  baseModelId: string;
  datasetSource?: string;
  hyperparameters?: Record<string, unknown>;
}

export async function createTrainingJob(input: CreateTrainingJobInput) {
  await delay(120, 260);
  if (!input.baseModelId) throw new Error("baseModelId is required");
  const hp = input.hyperparameters ?? {};
  const job: MockTrainingJob = {
    id: `job_${Date.now().toString(36)}`,
    name: input.name ?? `${input.baseModelId} fine-tune`,
    type: "finetune",
    collectionIds: [],
    baseModel: input.baseModelId,
    dataset: { id: "ds_link", name: input.datasetSource ?? "linked dataset", samples: 0, collectionIds: [] },
    hyperparams: {
      learningRate: Number(hp.learning_rate ?? 2e-4),
      epochs: Number(hp.epochs ?? 3),
      batchSize: Number(hp.batch_size ?? 8),
      gradientAccumulation: 1,
      warmupRatio: 0.03,
      weightDecay: 0,
      maxSeqLength: Number(hp.max_seq_length ?? 2048),
      loraRank: Number(hp.lora_rank ?? 16),
      loraAlpha: Number(hp.lora_alpha ?? 32),
      loraDropout: Number(hp.lora_dropout ?? 0.05),
      optimizer: "adamw_torch",
      scheduler: "cosine",
    },
    status: "queued",
    progress: 0,
    currentStep: 0,
    totalSteps: 0,
    metrics: [],
    evaluation: [],
    gpus: [],
    adapters: [],
    logs: [],
    createdBy: "user_admin",
    starred: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockTrainingJobs.unshift(job);
  return job;
}

export async function startTrainingJob(jid: string) {
  await delay(80, 200);
  const idx = mockTrainingJobs.findIndex((j) => j.id === jid);
  if (idx < 0) throw new Error("Training job not found");
  const updated: MockTrainingJob = {
    ...mockTrainingJobs[idx]!,
    status: "preparing",
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockTrainingJobs[idx] = updated;
  return updated;
}
