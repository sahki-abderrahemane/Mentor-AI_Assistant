"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services";

export const adminKeys = {
  users: (params: unknown) => ["admin", "users", params] as const,
  roles: ["admin", "roles"] as const,
  permissions: ["admin", "permissions"] as const,
  queues: ["admin", "queues"] as const,
  workers: ["admin", "workers"] as const,
  logs: (params: unknown) => ["admin", "logs", params] as const,
  aiServices: ["admin", "ai-services"] as const,
  health: ["admin", "health"] as const,
};

export function useAdminUsers(params: Parameters<typeof adminService.users>[0]) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => adminService.users(params),
  });
}

export function useAdminRoles() {
  return useQuery({
    queryKey: adminKeys.roles,
    queryFn: () => adminService.roles(),
  });
}

export function useAdminPermissions() {
  return useQuery({
    queryKey: adminKeys.permissions,
    queryFn: () => adminService.permissions(),
  });
}

export function useQueues() {
  return useQuery({
    queryKey: adminKeys.queues,
    queryFn: () => adminService.queues(),
    refetchInterval: 8_000,
  });
}

export function useWorkers() {
  return useQuery({
    queryKey: adminKeys.workers,
    queryFn: () => adminService.workers(),
    refetchInterval: 6_000,
  });
}

export function useLogs(params: Parameters<typeof adminService.logs>[0]) {
  return useQuery({
    queryKey: adminKeys.logs(params),
    queryFn: () => adminService.logs(params),
    refetchInterval: 8_000,
  });
}

export function useAdminQueues() {
  return useQueues();
}

export function useAdminLogs(params: Parameters<typeof adminService.logs>[0]) {
  return useLogs(params);
}

export function useAIServices() {
  return useQuery({
    queryKey: adminKeys.aiServices,
    queryFn: () => adminService.aiServices(),
    refetchInterval: 12_000,
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: adminKeys.health,
    queryFn: () => adminService.health(),
    refetchInterval: 5_000,
  });
}
