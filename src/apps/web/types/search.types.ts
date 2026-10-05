import type { AuditFields } from "./api.types";
import type { ChatCitation } from "./chat.types";

export type SearchScope = "all" | "documents" | "collections" | "projects";

export interface SearchFilters {
  scope?: SearchScope;
  collectionIds?: string[];
  projectIds?: string[];
  documentTypes?: string[];
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  language?: string;
}

export type SearchMode = "semantic" | "hybrid" | "keyword";

export interface SearchResult {
  id: string;
  documentId: string;
  documentTitle: string;
  collectionId?: string;
  collectionName?: string;
  projectId?: string;
  projectName?: string;
  page?: number;
  section?: string;
  snippet: string;
  highlight?: string;
  score: number;
  citations?: ChatCitation[];
}

export interface SearchQuery {
  query: string;
  mode?: SearchMode;
  filters?: SearchFilters;
  limit?: number;
}

export interface SearchHistoryItem extends AuditFields {
  id: string;
  query: string;
  mode: SearchMode;
  resultCount: number;
}
