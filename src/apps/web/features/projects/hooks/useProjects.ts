"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsService, collectionsService } from "@/services";
import type { CreateProjectInput, UpdateProjectInput } from "@/types";

export const projectKeys = {
  all: ["projects"] as const,
  list: (params: unknown) => ["projects", "list", params] as const,
  detail: (id: string) => ["projects", "detail", id] as const,
};

export const collectionKeys = {
  all: ["collections"] as const,
  list: (params: unknown) => ["collections", "list", params] as const,
  detail: (id: string) => ["collections", "detail", id] as const,
};

/* Projects */
export function useProjects(params: Parameters<typeof projectsService.list>[0]) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectsService.list(params),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsService.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateProjectInput }) =>
      projectsService.update(id, patch),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
      qc.invalidateQueries({ queryKey: projectKeys.detail(id) });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  });
}

/* Collections */
export function useCollections(params: Parameters<typeof collectionsService.list>[0]) {
  return useQuery({
    queryKey: collectionKeys.list(params),
    queryFn: () => collectionsService.list(params),
  });
}

export function useCollection(id: string) {
  return useQuery({
    queryKey: collectionKeys.detail(id),
    queryFn: () => collectionsService.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof collectionsService.create>[0]) =>
      collectionsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: collectionKeys.all }),
  });
}

export function useUpdateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof collectionsService.update>[1] }) =>
      collectionsService.update(id, patch),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: collectionKeys.all });
      qc.invalidateQueries({ queryKey: collectionKeys.detail(id) });
    },
  });
}

export function useDeleteCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => collectionsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: collectionKeys.all }),
  });
}
