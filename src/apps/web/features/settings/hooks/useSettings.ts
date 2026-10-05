"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/services";
import type { UserSettings } from "@/types";
import { usePreferencesStore } from "@/stores/preferences.store";

export const settingsKeys = {
  all: ["settings"] as const,
  detail: ["settings", "me"] as const,
  apiKeys: ["settings", "api-keys"] as const,
  integrations: ["settings", "integrations"] as const,
};

export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.detail,
    queryFn: () => settingsService.get(),
    staleTime: 1000 * 60,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<UserSettings>) => settingsService.update(patch),
    onSuccess: (next) => {
      qc.setQueryData(settingsKeys.detail, next);
      if (next.appearance?.theme) {
        usePreferencesStore.getState().setTheme(next.appearance.theme);
      }
      if (next.appearance?.density) {
        usePreferencesStore.getState().setDensity(next.appearance.density);
      }
    },
  });
}

export function useApiKeys() {
  return useQuery({
    queryKey: settingsKeys.apiKeys,
    queryFn: () => settingsService.apiKeys.list(),
  });
}

export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; scopes: string[] }) => settingsService.apiKeys.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: settingsKeys.apiKeys }),
  });
}

export function useRevokeApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsService.apiKeys.revoke(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: settingsKeys.apiKeys }),
  });
}

export function useIntegrations() {
  return useQuery({
    queryKey: settingsKeys.integrations,
    queryFn: () => settingsService.integrations.list(),
  });
}

export function useToggleIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsService.integrations.toggle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: settingsKeys.integrations }),
  });
}
