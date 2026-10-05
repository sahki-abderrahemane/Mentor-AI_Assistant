import { delay, paginate } from "../seed";
import { mockCollections } from "./data";
import type { MockCollection } from "./data";

export interface ListCollectionsParams {
  page?: number;
  pageSize?: number;
  query?: string;
  projectId?: string;
  starred?: boolean;
  status?: MockCollection["status"];
  tag?: string;
}

export async function listCollections(params: ListCollectionsParams = {}) {
  await delay(120, 260);
  let result = [...mockCollections];
  if (params.projectId) {
    result = result.filter((c) => c.projectId === params.projectId);
  }
  if (params.starred !== undefined) {
    result = result.filter((c) => c.starred === params.starred);
  }
  if (params.status) {
    result = result.filter((c) => c.status === params.status);
  }
  if (params.tag) {
    result = result.filter((c) => c.tags.includes(params.tag!));
  }
  if (params.query) {
    const q = params.query.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }
  return paginate(result, params.page ?? 1, params.pageSize ?? 20);
}

export async function getCollection(cid: string) {
  await delay(80, 200);
  const collection = mockCollections.find((c) => c.id === cid);
  if (!collection) throw new Error("Collection not found");
  return collection;
}

export async function createCollection(input: Partial<MockCollection>) {
  await delay(160, 320);
  const now = new Date().toISOString();
  const collection: MockCollection = {
    id: `col_${Math.random().toString(36).slice(2, 8)}`,
    projectId: input.projectId ?? "",
    projectName: input.projectName ?? "",
    name: input.name ?? "Untitled collection",
    description: input.description ?? "",
    icon: input.icon ?? "Layers",
    ownerId: "usr_current",
    documentCount: 0,
    totalSize: 0,
    vectorIndexed: 0,
    citationCount: 0,
    status: "ready",
    starred: false,
    tags: input.tags ?? [],
    createdAt: now,
    updatedAt: now,
  };
  mockCollections.unshift(collection);
  return collection;
}

export async function updateCollection(cid: string, patch: Partial<MockCollection>) {
  await delay(80, 200);
  const idx = mockCollections.findIndex((c) => c.id === cid);
  if (idx < 0) throw new Error("Collection not found");
  const current = mockCollections[idx]!;
  const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
  mockCollections[idx] = updated;
  return updated;
}

export async function deleteCollection(cid: string) {
  await delay(80, 200);
  const idx = mockCollections.findIndex((c) => c.id === cid);
  if (idx < 0) return;
  mockCollections.splice(idx, 1);
}
