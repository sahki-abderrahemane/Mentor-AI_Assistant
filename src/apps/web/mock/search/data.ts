import { delay, pick } from "../seed";
import { mockDocuments } from "../documents/data";
import { mockCollections } from "../collections/data";
import { mockProjects } from "../projects/data";
import type { MockConversation } from "../chat/data";

export type MockSearchMode = "semantic" | "hybrid" | "keyword";

export interface MockSearchFilters {
  collectionIds?: string[];
  projectIds?: string[];
  documentTypes?: string[];
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface MockSearchResult {
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
}

const KEYWORD_WEIGHT = 0.5;
const SEMANTIC_FUZZ = 0.18;

function tokenize(s: string): string[] {
  return s.toLowerCase().split(/[^a-z0-9]+/i).filter(Boolean);
}

function tokenMatchScore(query: string[], docTokens: string[]): number {
  const set = new Set(docTokens);
  let hits = 0;
  for (const t of query) if (set.has(t)) hits += 1;
  return query.length ? hits / query.length : 0;
}

export interface SearchInput {
  query: string;
  mode?: MockSearchMode;
  filters?: MockSearchFilters;
  limit?: number;
}

export async function search(input: SearchInput): Promise<MockSearchResult[]> {
  await delay(140, 320);
  const queryTokens = tokenize(input.query);
  const docs = mockDocuments.filter((d) => {
    const f = input.filters ?? {};
    if (f.collectionIds && f.collectionIds.length && !f.collectionIds.includes(d.collectionId)) return false;
    if (f.projectIds && f.projectIds.length && !f.projectIds.includes(d.projectId)) return false;
    if (f.documentTypes && f.documentTypes.length && !f.documentTypes.includes(d.fileType)) return false;
    if (f.tags && f.tags.length && !f.tags.some((t) => d.tags.includes(t))) return false;
    if (f.dateFrom && d.createdAt < f.dateFrom) return false;
    if (f.dateTo && d.createdAt > f.dateTo) return false;
    return true;
  });
  const scored = docs.map((d) => {
    const docTokens = tokenize(`${d.title} ${d.abstract} ${d.preview.text}`);
    const kw = tokenMatchScore(queryTokens, docTokens);
    const sem = Math.max(0.05, Math.min(0.99, kw + SEMANTIC_FUZZ + (Math.random() - 0.5) * 0.1));
    const score =
      input.mode === "semantic" ? sem : input.mode === "keyword" ? kw : kw * KEYWORD_WEIGHT + sem * (1 - KEYWORD_WEIGHT);
    const matchIndex = queryTokens.length
      ? docTokens.findIndex((t) => t.startsWith(queryTokens[0]!))
      : -1;
    const start = Math.max(0, (matchIndex >= 0 ? Math.max(0, matchIndex * 4) : 0) - 60);
    const snippet = (d.preview.text ?? "").slice(start, start + 320);
    const highlighted = queryTokens.length
      ? snippet.replace(
          new RegExp(`(${queryTokens[0]})`, "ig"),
          "<mark>$1</mark>"
        )
      : snippet;
    return {
      id: `res_${d.id}`,
      documentId: d.id,
      documentTitle: d.title,
      collectionId: d.collectionId,
      collectionName:
        mockCollections.find((c) => c.id === d.collectionId)?.name ?? undefined,
      projectId: d.projectId,
      projectName:
        mockProjects.find((p) => p.id === d.projectId)?.name ?? undefined,
      page: 1 + Math.floor(Math.random() * Math.max(1, (d.stats.pages ?? 12) - 1)),
      section: pick(["Method", "Experiments", "Results", "Discussion", "Conclusion"]),
      snippet,
      highlight: highlighted,
      score: Number(score.toFixed(3)),
    } as MockSearchResult;
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, input.limit ?? 20);
}

void (null as unknown as MockConversation | undefined);
