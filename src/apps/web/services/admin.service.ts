import {
  getSystemHealth as mockHealth,
  listAdminUsers as mockUsers,
  listLogs as mockLogs,
} from "@/mock/admin/handlers";
import { getApiClient } from "@/lib/api";

export const adminService = {
  users: (params?: Parameters<typeof mockUsers>[0]) => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.admin.listAdminUsers(params ?? {});
    return c.real.get("/admin/users", { params }).then((r) => r.data);
  },
  suspendUser: (id: string) => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.admin.suspendUser(id);
    return c.real.post(`/admin/users/${id}/suspend`).then((r) => r.data);
  },
  unsuspendUser: (id: string) => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.admin.unsuspendUser(id);
    return c.real.post(`/admin/users/${id}/unsuspend`).then((r) => r.data);
  },
  deleteUser: (id: string) => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.admin.deleteUser(id);
    return c.real.delete(`/admin/users/${id}`).then((r) => r.data);
  },
  roles: () => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.admin.listAdminRoles();
    return c.real.get("/admin/roles").then((r) => r.data);
  },
  permissions: () => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.admin.listAdminPermissions();
    return c.real.get("/admin/permissions").then((r) => r.data);
  },
  queues: () => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.admin.listQueues();
    return c.real.get("/admin/queues").then((r) => r.data);
  },
  workers: () => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.admin.listWorkers();
    return c.real.get("/admin/workers").then((r) => r.data);
  },
  logs: (params?: Parameters<typeof mockLogs>[0]) => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.admin.listLogs(params ?? {});
    return c.real.get("/admin/logs", { params }).then((r) => r.data);
  },
  aiServices: () => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.admin.listAIServices();
    return c.real.get("/admin/ai-services").then((r) => r.data);
  },
  health: () => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.admin.getSystemHealth();
    return c.real.get("/admin/health").then((r) => r.data);
  },
};

void mockHealth;
