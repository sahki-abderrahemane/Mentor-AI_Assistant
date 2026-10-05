"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/services";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (params: unknown) => ["notifications", "list", params] as const,
  unreadCount: ["notifications", "unread"] as const,
};

export function useNotifications(params?: Parameters<typeof notificationsService.list>[0]) {
  const list = useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsService.list(params ?? {}),
    refetchInterval: 30_000,
  });
  const unreadCount = useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: () => notificationsService.unreadCount(),
    refetchInterval: 30_000,
  });
  return { list, unreadCount };
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, read }: { id: string; read?: boolean }) =>
      notificationsService.markRead(id, read ?? true),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
