"use client";

import { useQuery } from "@tanstack/react-query";
import { studyguideService } from "@/services/studyguide.service";
import type { ListGuidesParams } from "@/services/studyguide.service";

export const studyguideKeys = {
  all: ["studyguides"] as const,
  list: (params?: ListGuidesParams) => [...studyguideKeys.all, "list", params ?? {}] as const,
  detail: (id: string) => [...studyguideKeys.all, "detail", id] as const,
};

export function useStudyGuides(params?: ListGuidesParams) {
  return useQuery({
    queryKey: studyguideKeys.list(params),
    queryFn: () => studyguideService.list(params),
  });
}

export function useStudyGuide(id: string) {
  return useQuery({
    queryKey: studyguideKeys.detail(id),
    queryFn: () => studyguideService.get(id),
    enabled: Boolean(id),
  });
}