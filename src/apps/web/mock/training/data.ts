import { faker, id, isoDate, pick, paginate } from "../seed";
import { mockProjects } from "../projects/data";
import { mockCollections } from "../collections/data";
import { mockUsers } from "../users/data";

export type MockTrainingStatus =
  | "queued"
  | "preparing"
  | "running"
  | "evaluating"
  | "completed"
  | "failed"
  | "cancelled"
  | "paused";

export type MockTrainingMethod = "qlora" | "lora" | "full";
export type MockTrainingJobType = "finetune" | "continued-pretraining" | "instruction-tuning";

export interface MockTrainingMetrics {
  step: number;
  loss: number;
  learningRate: number;
  gradNorm?: number;
  tokensPerSecond?: number;
  evalLoss?: number;
  evalPerplexity?: number;
  timestamp: string;
}

export interface MockTrainingGPU {
  id: number;
  name: string;
  utilization: number;
  memoryUsed: number;
  memoryTotal: number;
  temperatureC: number;
  powerDrawW: number;
}

export interface MockTrainingEvaluation {
  metric: string;
  score: number;
  baseline?: number;
  delta?: number;
}

export interface MockTrainingAdapter {
  id: string;
  name: string;
  size: number;
  baseModel: string;
  rank: number;
  alpha: number;
  downloadUrl?: string;
}

export interface MockTrainingLog {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
}

export interface MockTrainingJob {
  id: string;
  name: string;
  type: MockTrainingJobType;
  projectId?: string;
  projectName?: string;
  collectionIds: string[];
  baseModel: string;
  dataset: { id: string; name: string; samples: number; collectionIds: string[]; generatedBy?: string };
  hyperparams: {
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
  };
  status: MockTrainingStatus;
  progress: number;
  currentStep: number;
  totalSteps: number;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  metrics: MockTrainingMetrics[];
  evaluation: MockTrainingEvaluation[];
  gpus: MockTrainingGPU[];
  adapters: MockTrainingAdapter[];
  logs: MockTrainingLog[];
  createdBy: string;
  starred: boolean;
  createdAt: string;
  updatedAt: string;
}

const baseJobs = [
  { name: "Llama-3.1-8B QLoRA on retrieval dataset", baseModel: "llama-3.1-8b-instruct", type: "finetune" as const },
  { name: "Mistral-7B instruction tuning", baseModel: "mistral-7b-instruct", type: "instruction-tuning" as const },
  { name: "Continued pretraining — Attention papers", baseModel: "pythia-1.4b", type: "continued-pretraining" as const },
  { name: "Qwen-2.5 7B eval dataset ablation", baseModel: "qwen-2.5-7b", type: "finetune" as const },
  { name: "Phi-3 Mini domain adaptation", baseModel: "phi-3-mini", type: "finetune" as const },
  { name: "Llama-3.1-8B safety adapter v2", baseModel: "llama-3.1-8b-instruct", type: "instruction-tuning" as const },
  { name: "Mistral-7B RAG reranker LoRA", baseModel: "mistral-7b-instruct", type: "finetune" as const },
  { name: "Gemma-2-9B continued pretraining", baseModel: "gemma-2-9b", type: "continued-pretraining" as const },
  { name: "Qwen-2.5 7B tool-use adapter", baseModel: "qwen-2.5-7b", type: "instruction-tuning" as const },
  { name: "Llama-3.1-8B citation tuning", baseModel: "llama-3.1-8b-instruct", type: "instruction-tuning" as const },
  { name: "Phi-3 Mini embedding fine-tune", baseModel: "phi-3-mini", type: "finetune" as const },
  { name: "Mistral-7B knowledge adapter", baseModel: "mistral-7b-instruct", type: "finetune" as const },
];

function buildMetrics(total: number): MockTrainingMetrics[] {
  const points: MockTrainingMetrics[] = [];
  let step = 0;
  let loss = 3.4;
  for (let i = 0; i < 80; i++) {
    step = Math.round((i / 79) * total);
    loss = Math.max(0.4, loss - Math.random() * 0.12 - i * 0.005);
    points.push({
      step,
      loss: Number(loss.toFixed(4)),
      learningRate: 2e-4 - i * 1e-6,
      gradNorm: Number((Math.random() * 1.4 + 0.2).toFixed(3)),
      tokensPerSecond: Math.round(Math.random() * 1200 + 400),
      evalLoss: i % 8 === 0 && i !== 0 ? Number((loss + Math.random() * 0.05).toFixed(4)) : undefined,
      evalPerplexity: i % 8 === 0 && i !== 0 ? Number(Math.exp(loss + Math.random() * 0.05).toFixed(3)) : undefined,
      timestamp: isoDate(0, i * 60),
    });
  }
  return points;
}

function buildGPUs(count: number): MockTrainingGPU[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    name: pick(["NVIDIA A100 80GB", "NVIDIA H100 80GB", "NVIDIA RTX 6000 Ada"]),
    utilization: faker.number.int({ min: 22, max: 99 }),
    memoryUsed: faker.number.int({ min: 12_000, max: 72_000 }),
    memoryTotal: 80_000,
    temperatureC: faker.number.int({ min: 42, max: 82 }),
    powerDrawW: faker.number.int({ min: 120, max: 480 }),
  }));
}

function buildLogs(): MockTrainingLog[] {
  return Array.from({ length: 16 }).map(() => {
    const level = pick(["info", "info", "info", "warn", "error", "debug"]) as MockTrainingLog["level"];
    return {
      id: id("log"),
      timestamp: isoDate(0, faker.number.int({ min: 0, max: 600 })),
      level,
      message: pick([
        "Loaded 1245 samples into the trainer.",
        "Checkpoint saved at step 240.",
        "Skipped 4 samples due to truncation.",
        "Switching to cosine LR schedule.",
        "GPU 0 memory pressure high — reducing micro batch.",
        "Eval pass complete.",
      ]),
    };
  });
}

function buildEvaluation(): MockTrainingEvaluation[] {
  return [
    { metric: "EM", score: 0.412, baseline: 0.301, delta: 0.111 },
    { metric: "F1", score: 0.636, baseline: 0.524, delta: 0.112 },
    { metric: "BLEU", score: 0.281, baseline: 0.220, delta: 0.061 },
    { metric: "Citation Precision", score: 0.812, baseline: 0.602, delta: 0.21 },
  ].map((m) => ({
    metric: m.metric,
    score: m.score + (Math.random() - 0.5) * 0.04,
    baseline: m.baseline,
    delta: m.delta,
  }));
}

export const mockTrainingJobs: MockTrainingJob[] = baseJobs.map((b, i) => {
  const project = mockProjects[i % mockProjects.length]!;
  const coll = mockCollections[i % mockCollections.length]!;
  const totalSteps = faker.number.int({ min: 200, max: 1600 });
  const status: MockTrainingStatus = (() => {
    const r = Math.random();
    if (r < 0.45) return "running";
    if (r < 0.65) return "completed";
    if (r < 0.78) return "preparing";
    if (r < 0.88) return "queued";
    if (r < 0.95) return "failed";
    return "paused";
  })();
  const progress =
    status === "completed"
      ? 100
      : status === "failed" || status === "paused"
      ? faker.number.int({ min: 8, max: 60 })
      : status === "queued" || status === "preparing"
      ? faker.number.int({ min: 0, max: 8 })
      : faker.number.int({ min: 12, max: 92 });
  const owner = mockUsers[0]!;
  return {
    id: `job_${String(i + 1).padStart(3, "0")}`,
    name: b.name,
    type: b.type,
    projectId: project.id,
    projectName: project.name,
    collectionIds: [coll.id],
    baseModel: b.baseModel,
    dataset: {
      id: id("ds"),
      name: `${project.name} dataset v1`,
      samples: faker.number.int({ min: 800, max: 6000 }),
      collectionIds: [coll.id],
      generatedBy: "Knowledge pipeline v2",
    },
    hyperparams: {
      learningRate: faker.number.float({ min: 1e-5, max: 5e-4, fractionDigits: 6 }),
      epochs: faker.number.int({ min: 1, max: 5 }),
      batchSize: pick([4, 8, 16, 32]),
      gradientAccumulation: pick([2, 4, 8, 16]),
      warmupRatio: pick([0.03, 0.05, 0.1]),
      weightDecay: 0.0,
      maxSeqLength: pick([1024, 2048, 4096]),
      loraRank: pick([8, 16, 32, 64]),
      loraAlpha: pick([16, 32, 64]),
      loraDropout: 0.05,
      optimizer: "paged_adamw_8bit",
      scheduler: "cosine",
    },
    status,
    progress,
    currentStep: Math.round((progress / 100) * totalSteps),
    totalSteps,
    startedAt: isoDate(faker.number.int({ min: 0, max: 12 })),
    completedAt: status === "completed" ? isoDate(0) : undefined,
    durationMs: faker.number.int({ min: 120_000, max: 72_000_000 }),
    metrics: buildMetrics(totalSteps),
    evaluation: buildEvaluation(),
    gpus: buildGPUs(faker.number.int({ min: 1, max: 4 })),
    adapters: [
      {
        id: id("ada"),
        name: "lora_adapter_v1",
        size: faker.number.int({ min: 12_000_000, max: 80_000_000 }),
        baseModel: b.baseModel,
        rank: 16,
        alpha: 32,
        downloadUrl: "#",
      },
    ],
    logs: buildLogs(),
    createdBy: owner.id,
    starred: Math.random() > 0.7,
    createdAt: isoDate(faker.number.int({ min: 1, max: 30 })),
    updatedAt: isoDate(0),
  } as MockTrainingJob;
});

export function getTrainingJob(id: string): MockTrainingJob | undefined {
  return mockTrainingJobs.find((j) => j.id === id);
}
