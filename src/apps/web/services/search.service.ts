import { search as mockSearch } from "@/mock/search/data";
import { getApiClient } from "@/lib/api";
import type { SearchResult } from "@/types";

export const searchService = {
  query: (input: Parameters<typeof mockSearch>[0]) => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.search.search(input);
    const body = toBackendQuery(input);
    return c.real.post("/search", body).then((r) => (r.data as SearchResult[]).map((res) => ({ ...res, page: res.page ?? (res as RawSearchResult).pageStart })));
  },
};

interface RawSearchResult {
  pageStart?: number;
}

function toBackendQuery(input: Parameters<typeof mockSearch>[0]): { query: string; topK?: number; documentIds?: string[] } {
  const query = typeof input.query === "string" ? input.query : "";
  const out: { query: string; topK?: number; documentIds?: string[] } = { query };
  const filters = (input.filters ?? {}) as { collectionIds?: string[] };
  if (Array.isArray(filters.collectionIds) && filters.collectionIds.length > 0) {
    out.documentIds = filters.collectionIds;
  }
  if (typeof input.limit === "number" && Number.isFinite(input.limit)) {
    out.topK = input.limit;
  }
  return out;
}
