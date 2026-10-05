import {
  deleteDocument as mockDeleteDocument,
  getDocument as mockGetDocument,
  listDocuments as mockListDocuments,
  reindexDocument as mockReindexDocument,
  updateDocument as mockUpdateDocument,
  uploadDocument as mockUploadDocument,
} from "@/mock/documents/handlers";
import { getApiClient } from "@/lib/api";

export const documentsService = {
  list: (params?: Parameters<typeof mockListDocuments>[0]) => {
    const client = getApiClient();
    if (client.kind === "mock") return client.mock.documents.listDocuments(params ?? {});
    return client.real.get("/documents", { params }).then((r) => r.data);
  },
  get: (id: string) => {
    const client = getApiClient();
    if (client.kind === "mock") return client.mock.documents.getDocument(id);
    return client.real.get(`/documents/${id}`).then((r) => r.data);
  },
  upload: (
    input: Parameters<typeof mockUploadDocument>[0],
    onProgress?: (progress: number) => void
  ) => {
    const client = getApiClient();
    if (client.kind === "mock") return client.mock.documents.uploadDocument(input, onProgress);
    const form = new FormData();
    if (input.file) form.append("file", input.file as unknown as Blob);
    form.append("collectionId", input.collectionId);
    form.append("projectId", input.projectId);
    // Backend reads `title` (optional) and uses the CSV-formatted `tags` string.
    // Mock `UploadDocumentInput` carries title inside `metadata`; surface it
    // for the real-mode payload without breaking the mock contract.
    const title = input.metadata?.title;
    if (title) form.append("title", title);
    if (input.tags && input.tags.length > 0) form.append("tags", input.tags.join(","));
    return client.real
      .post("/documents", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100));
        },
      })
      .then((r) => r.data);
  },
  update: (id: string, patch: Parameters<typeof mockUpdateDocument>[1]) => {
    const client = getApiClient();
    if (client.kind === "mock") return client.mock.documents.updateDocument(id, patch);
    return client.real.patch(`/documents/${id}`, patch).then((r) => r.data);
  },
  remove: (id: string) => {
    const client = getApiClient();
    if (client.kind === "mock") return client.mock.documents.deleteDocument(id);
    return client.real.delete(`/documents/${id}`).then((r) => r.data);
  },
  reindex: (id: string) => {
    const client = getApiClient();
    if (client.kind === "mock") return client.mock.documents.reindexDocument(id);
    return client.real.post(`/documents/${id}/reindex`).then((r) => r.data);
  },
  download: (id: string) => {
    const client = getApiClient();
    if (client.kind === "mock") {
      return Promise.resolve(new Blob([`Mock download for document ${id}`], { type: "text/plain" }));
    }
    return client.real
      .get(`/documents/${id}/download`, { responseType: "blob" })
      .then((r) => r.data as Blob);
  },
};
