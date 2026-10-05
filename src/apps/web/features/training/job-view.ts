/**
 * Normalizes the two training-job shapes the UI can receive:
 * - real API: TrainingJob entity (config jsonb, progress/steps counters)
 * - mock API: MockTrainingJob (modelName/hyperparams/currentEpoch...)
 */
export interface TrainingJobView {
  id: string;
  name: string;
  status: string;
  baseModelId: string | null;
  baseModelLabel: string;
  datasetLabel: string;
  progress: number | null;
  currentStep: number | null;
  totalSteps: number | null;
  epochs: number | null;
  currentEpoch: number | null;
  totalEpochs: number | null;
  learningRate: number | null;
  batchSize: number | null;
  method: string | null;
  datasetAdapter: string | null;
  durationMs: number | null;
  metrics: Array<{ step: number; loss: number; learningRate: number; timestamp: string }>;
  updatedAt: string;
}

type AnyJob = Record<string, unknown>;

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

export function toTrainingJobView(job: AnyJob): TrainingJobView {
  const config = (job.config as AnyJob | undefined) ?? {};
  const hyper = (job.hyperparams as AnyJob | undefined) ?? {};
  const dataset = job.dataset as { name?: string } | undefined;

  const epochs = num(config.epochs) ?? num(hyper.epochs);
  const totalEpochs = num(job.totalEpochs) ?? epochs;

  return {
    id: String(job.id),
    name: str(job.name) ?? str(job.modelName) ?? "Training job",
    status: String(job.status ?? "queued"),
    baseModelId: str(job.baseModelId) ?? str(job.baseModel),
    baseModelLabel: str(job.baseModelName) ?? str(job.baseModel) ?? "—",
    datasetLabel:
      str(config.dataset_source) ??
      str(dataset?.name) ??
      str(job.datasetName) ??
      "—",
    progress: num(job.progress),
    currentStep: num(job.currentStep),
    totalSteps: num(job.totalSteps),
    epochs,
    currentEpoch: num(job.currentEpoch),
    totalEpochs,
    learningRate: num(config.learning_rate) ?? num(hyper.learningRate),
    batchSize: num(config.batch_size) ?? num(hyper.batchSize),
    method: str(config.method),
    datasetAdapter: str(config.dataset_adapter) ?? str((job.dataset as AnyJob | undefined)?.format),
    durationMs: num(job.durationMs) ?? num(job.duration),
    metrics: Array.isArray(job.metrics)
      ? (job.metrics as TrainingJobView["metrics"]).filter(
          (m) => m && typeof m.step === "number" && typeof m.loss === "number",
        )
      : [],
    updatedAt: String(job.updatedAt ?? job.createdAt ?? new Date().toISOString()),
  };
}
