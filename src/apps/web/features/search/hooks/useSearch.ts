"use client";

import { useQuery } from "@tanstack/react-query";
import { searchService } from "@/services";
import type { SearchQuery } from "@/types";

export const searchKeys = {
  query: (q: SearchQuery) => ["search", q] as const,
};

export function useSearch(query: SearchQuery) {
  return useQuery({
    queryKey: searchKeys.query(query),
    queryFn: () => searchService.query(query),
    enabled: Boolean(query.query && query.query.trim().length > 0),
    staleTime: 5_000,
  });
}
