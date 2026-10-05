import type { AuditFields } from "./api.types";

export type DocumentType =
  | "pdf"
  | "docx"
  | "txt"
  | "html"
  | "markdown"
  | "epub"
  | "other";

export type DocumentStatus =
  | "uploading"
  | "queued"
  | "processing"
  | "ready"
  | "failed"
  | "archived";

export type ProcessingStage =
  | "uploaded"
  | "extracting"
  | "cleaning"
  | "structuring"
  | "chunking"
  | "embedding"
  | "indexed"
  | "completed";

export interface DocumentAuthor {
  name: string;
  affiliation?: string;
}

export interface DocumentPreview {
  text: string;
  pageCount: number;
  language?: string;
}

export interface KnowledgeUnit {
  id: string;
  unitNumber: number;
  text: string;
  section?: string;
  subsection?: string;
  pageStart?: number;
  pageEnd?: number;
  wordCount: number;
  tokens?: number;
  citations: number;
}

export interface ProcessingTimelineEntry {
  stage: ProcessingStage;
  status: "pending" | "running" | "done" | "failed";
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  message?: string;
}

export interface DocumentStats {
  pages?: number;
  words: number;
  characters: number;
  chunks: number;
  citations: number;
  size: number;
  readingTimeMin: number;
}

export interface Document extends AuditFields {
  id: string;
  collectionId: string;
  projectId: string;
  title: string;
  fileName: string;
  fileType: DocumentType;
  mimeType: string;
  size: number;
  url?: string;
  thumbnailUrl?: string;
  status: DocumentStatus;
  progress?: number;
  error?: string;
  authors: DocumentAuthor[];
  abstract?: string;
  tags: string[];
  language?: string;
  stats: DocumentStats;
  preview: DocumentPreview;
  knowledgeUnits?: KnowledgeUnit[];
  timeline?: ProcessingTimelineEntry[];
  indexedAt?: string;
  starred: boolean;
  uploadedBy: string;
}

export interface UploadDocumentInput {
  file: File;
  collectionId: string;
  projectId: string;
  tags?: string[];
  metadata?: Partial<Pick<Document, "title" | "authors" | "abstract">>;
}

export interface UploadProgress {
  documentId: string;
  fileName: string;
  progress: number;
  status: DocumentStatus;
}

export interface UpdateDocumentInput {
  title?: string;
  tags?: string[];
  starred?: boolean;
  abstract?: string;
}
