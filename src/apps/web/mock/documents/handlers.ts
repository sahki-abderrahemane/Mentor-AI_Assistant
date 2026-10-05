import { delay, paginate, faker, isoDate } from "../seed";
import { mockDocuments } from "./data";
import type { MockDocument, MockProcessingStage } from "./data";

export interface ListDocumentsParams {
  page?: number;
  pageSize?: number;
  query?: string;
  projectId?: string;
  collectionId?: string;
  status?: MockDocument["status"];
  fileType?: MockDocument["fileType"];
  starred?: boolean;
  tag?: string;
  sortBy?: "createdAt" | "updatedAt" | "title" | "size";
  sortOrder?: "asc" | "desc";
}

export async function listDocuments(params: ListDocumentsParams = {}) {
  await delay(140, 280);
  let result = [...mockDocuments];
  if (params.projectId) result = result.filter((d) => d.projectId === params.projectId);
  if (params.collectionId) result = result.filter((d) => d.collectionId === params.collectionId);
  if (params.status) result = result.filter((d) => d.status === params.status);
  if (params.fileType) result = result.filter((d) => d.fileType === params.fileType);
  if (params.starred !== undefined) result = result.filter((d) => d.starred === params.starred);
  if (params.tag) result = result.filter((d) => d.tags.includes(params.tag!));
  if (params.query) {
    const q = params.query.toLowerCase();
    result = result.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.fileName.toLowerCase().includes(q) ||
        d.abstract.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (params.sortBy) {
    const dir = params.sortOrder === "asc" ? 1 : -1;
    const key = params.sortBy;
    result.sort((a, b) => {
      const av = a[key] as number | string;
      const bv = b[key] as number | string;
      if (av === bv) return 0;
      return (av > bv ? 1 : -1) * dir;
    });
  }
  return paginate(result, params.page ?? 1, params.pageSize ?? 20);
}

export async function getDocument(docId: string) {
  await delay(80, 220);
  const doc = mockDocuments.find((d) => d.id === docId);
  if (!doc) throw new Error("Document not found");
  return doc;
}

export interface UploadDocumentInput {
  fileName?: string;
  file?: { name: string; size?: number; type?: string };
  collectionId: string;
  projectId: string;
  size?: number;
  mimeType?: string;
  tags?: string[];
  metadata?: { title?: string; authors?: unknown; abstract?: string };
}

function inferType(fileName: string): { type: MockDocument["fileType"]; mimeType: string } {
  const ext = fileName.toLowerCase().split(".").pop() ?? "";
  if (ext === "pdf") {
    return { type: "pdf", mimeType: "application/pdf" };
  }
  if (ext === "docx") {
    return {
      type: "docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
  }
  if (ext === "md" || ext === "markdown") {
    return { type: "markdown", mimeType: "text/markdown" };
  }
  if (ext === "html" || ext === "htm") {
    return { type: "html", mimeType: "text/html" };
  }
  return { type: "txt", mimeType: "text/plain" };
}

export async function uploadDocument(
  input: UploadDocumentInput,
  onProgress?: (progress: number) => void
): Promise<MockDocument> {
  const id = `doc_${Math.random().toString(36).slice(2, 8)}`;
  const fileName = input.fileName ?? input.file?.name ?? "untitled.pdf";
  const inferred = inferType(fileName);
  const size = input.size ?? input.file?.size ?? faker.number.int({ min: 300_000, max: 12_000_000 });
  const now = new Date().toISOString();
  const timeline: { stage: MockProcessingStage; status: "pending" | "running" | "done" | "failed"; startedAt?: string; completedAt?: string; durationMs?: number }[] = [];

  // Simulate progressive upload + processing
  const total = 100;
  for (let i = 0; i <= total; i += 10) {
    await delay(60, 120);
    onProgress?.(Math.min(100, i));
    if (i === 30) {
      timeline.push({ stage: "uploaded", status: "done", completedAt: now, durationMs: 1200 });
    }
    if (i === 60) {
      timeline.push({ stage: "extracting", status: "done", completedAt: now, durationMs: 4500 });
      timeline.push({ stage: "cleaning", status: "running" });
    }
  }
  timeline.push({ stage: "cleaning", status: "done" });
  timeline.push({ stage: "structuring", status: "done" });
  timeline.push({ stage: "chunking", status: "done" });
  timeline.push({ stage: "embedding", status: "done" });
  timeline.push({ stage: "indexed", status: "done" });
  timeline.push({ stage: "completed", status: "done" });

  const doc: MockDocument = {
    id,
    collectionId: input.collectionId,
    projectId: input.projectId,
    title: fileName.replace(/\.[^.]+$/, ""),
    fileName,
    fileType: inferred.type,
    mimeType: input.mimeType ?? inferred.mimeType,
    size,
    url: "#",
    thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(fileName)}/240/320`,
    status: "ready",
    authors: [],
    abstract: "",
    tags: [],
    language: "en",
    stats: {
      pages: faker.number.int({ min: 4, max: 24 }),
      words: faker.number.int({ min: 1200, max: 12000 }),
      characters: faker.number.int({ min: 6000, max: 70_000 }),
      chunks: faker.number.int({ min: 12, max: 80 }),
      citations: faker.number.int({ min: 0, max: 50 }),
      size,
      readingTimeMin: faker.number.int({ min: 4, max: 24 }),
    },
    preview: {
      text: faker.lorem.paragraphs(3, "\n\n"),
      pageCount: faker.number.int({ min: 4, max: 24 }),
      language: "en",
    },
    knowledgeUnits: [],
    timeline,
    indexedAt: isoDate(0),
    starred: false,
    uploadedBy: "usr_current",
    uploadedByName: "You",
    createdAt: now,
    updatedAt: now,
  };
  mockDocuments.unshift(doc);
  return doc;
}

export async function updateDocument(docId: string, patch: Partial<MockDocument>) {
  await delay(100, 200);
  const idx = mockDocuments.findIndex((d) => d.id === docId);
  if (idx < 0) throw new Error("Document not found");
  const current = mockDocuments[idx]!;
  const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
  mockDocuments[idx] = updated;
  return updated;
}

export async function deleteDocument(docId: string) {
  await delay(80, 180);
  const idx = mockDocuments.findIndex((d) => d.id === docId);
  if (idx < 0) return;
  mockDocuments.splice(idx, 1);
}

export async function reindexDocument(docId: string) {
  await delay(100, 220);
  const idx = mockDocuments.findIndex((d) => d.id === docId);
  if (idx < 0) throw new Error("Document not found");
  mockDocuments[idx] = { ...mockDocuments[idx]!, status: "queued", progress: 0 } as MockDocument;
  // Simulate eventual ready state
  setTimeout(() => {
    const i = mockDocuments.findIndex((d) => d.id === docId);
    if (i >= 0) {
      mockDocuments[i] = {
        ...mockDocuments[i]!,
        status: "ready",
        progress: undefined,
        indexedAt: new Date().toISOString(),
      } as MockDocument;
    }
  }, 1500);
  return mockDocuments[idx]!;
}
