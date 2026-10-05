import {
  downloadModel as mockDownload,
  getModel as mockGet,
  listAdapters as mockListAdapters,
  listMergedModels as mockListMerged,
  listModels as mockList,
} from "@/mock/models/handlers";
import { getApiClient } from "@/lib/api";

export const modelsService = {
  list: (params?: Parameters<typeof mockList>[0]) => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.models.listModels(params ?? {});
    return c.real.get("/models", { params }).then((r) => r.data);
  },
  get: (id: string) => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.models.getModel(id);
    return c.real.get(`/models/${id}`).then((r) => r.data);
  },
  adapters: () => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.models.listAdapters();
    return c.real.get("/models/adapters").then((r) => r.data);
  },
  merged: () => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.models.listMergedModels();
    return c.real.get("/models/merged").then((r) => r.data);
  },
  download: (id: string, onProgress?: (progress: number) => void) => {
    const c = getApiClient();
    if (c.kind === "mock") {
      // Mirror the mock behavior byprogress through state, polling exported list
      void onProgress;
      return c.mock.models.downloadModel(id);
    }
    return c.real
      .post(`/models/${id}/download`, undefined, {
        onDownloadProgress: (e) => {
          if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100));
        },
      })
      .then((r) => r.data);
  },
  cancelDownload: (id: string) => {
    const c = getApiClient();
    if (c.kind === "mock") return Promise.resolve({ id, status: "available" });
    return c.real.post(`/models/${id}/download/cancel`).then((r) => r.data);
  },
};

void mockDownload;
