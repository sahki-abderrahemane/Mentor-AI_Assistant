import type { AuditFields } from "./api.types";

export interface Collection extends AuditFields {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  icon?: string;
  ownerId: string;
  documentCount: number;
  totalSize: number;
  vectorIndexed: number;
  citationCount: number;
  status: "ready" | "indexing" | "failed" | "paused";
  starred: boolean;
  tags?: string[];
}

export interface CreateCollectionInput {
  projectId: string;
  name: string;
  description?: string;
  icon?: string;
  tags?: string[];
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string;
  icon?: string;
  starred?: boolean;
  tags?: string[];
}
