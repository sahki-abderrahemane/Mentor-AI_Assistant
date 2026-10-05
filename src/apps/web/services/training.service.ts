import type { ListTrainingJobsParams } from "@/mock/training/handlers";
import { getApiClient } from "@/lib/api";

export interface CreateTrainingJobInput {
  name?: string;
  baseModelId: string;
  datasetSource?: string;
  hyperparameters?: Record<string, unknown>;
}

export const trainingService = {
  list: (params?: ListTrainingJobsParams) => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.training.listTrainingJobs(params ?? {});
    return c.real.get("/training/jobs", { params }).then((r) => r.data);
  },
  get: (id: string) => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.training.getTrainingJob(id);
    return c.real.get(`/training/jobs/${id}`).then((r) => r.data);
  },
  create: (input: CreateTrainingJobInput) => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.training.createTrainingJob(input);
    return c.real
      .post("/training/jobs", {
        baseModelId: input.baseModelId,
        datasetSource: input.datasetSource,
        hyperparameters: { ...(input.hyperparameters ?? {}), name: input.name },
      })
      .then((r) => r.data);
  },
  start: (id: string) => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.training.startTrainingJob(id);
    return c.real.post(`/training/jobs/${id}/start`).then((r) => r.data);
  },
  cancel: (id: string) => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.training.cancelTrainingJob(id);
    return c.real.post(`/training/jobs/${id}/cancel`).then((r) => r.data);
  },
};
