"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsService } from "@/services";
import type { UpdateDocumentInput, UploadDocumentInput } from "@/types";

export const documentKeys = {
  all: ["documents"] as const,
  list: (params: unknown) => ["documents", "list", params] as const,
  detail: (id: string) => ["documents", "detail", id] as const,
  byCollection: (collectionId: string) => ["documents", "byCollection", collectionId] as const,
};

export function useDocuments(params: Parameters<typeof documentsService.list>[0]) {
  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: () => documentsService.list(params),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentsService.get(id),
    enabled: Boolean(id),
  });
}

export function useDocumentsByCollection(collectionId: string) {
  return useQuery({
    queryKey: documentKeys.byCollection(collectionId),
    queryFn: () => documentsService.list({ collectionId, pageSize: 100 }),
    enabled: Boolean(collectionId),
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      input,
      onProgress,
    }: {
      input: UploadDocumentInput;
      onProgress?: (progress: number) => void;
    }) => documentsService.upload(input, onProgress),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
}

export function useUpdateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateDocumentInput }) =>
      documentsService.update(id, patch),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: documentKeys.all });
      qc.invalidateQueries({ queryKey: documentKeys.detail(id) });
    },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: documentKeys.all }),
  });
}

export function useReindexDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsService.reindex(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: documentKeys.detail(id) });
    },
  });
}
