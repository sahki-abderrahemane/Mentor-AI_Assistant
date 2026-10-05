import { delay, isoDate, paginate } from "../seed";
import {
  mockAdminUsers,
  mockAdminRoles,
  mockAdminPermissions,
  mockQueues,
  mockWorkers,
  mockLogs,
  mockAIServices,
} from "./data";
import type { MockAdminUser } from "./data";

export async function listAdminUsers(params: { page?: number; pageSize?: number; query?: string; role?: MockAdminUser["role"] } = {}) {
  await delay(120, 240);
  let result = [...mockAdminUsers];
  if (params.role) result = result.filter((u) => u.role === params.role);
  if (params.query) {
    const q = params.query.toLowerCase();
    result = result.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
  return paginate(result, params.page ?? 1, params.pageSize ?? 20);
}

export async function listAdminRoles() {
  await delay(80, 200);
  return [...mockAdminRoles];
}

export async function listAdminPermissions() {
  await delay(80, 200);
  return [...mockAdminPermissions];
}

export async function listQueues() {
  await delay(80, 200);
  return [...mockQueues];
}

export async function listWorkers() {
  await delay(80, 200);
  return [...mockWorkers];
}

export async function listLogs(params: { page?: number; pageSize?: number; level?: "info" | "warn" | "error" | "debug"; service?: string; query?: string } = {}) {
  await delay(120, 240);
  let result = [...mockLogs];
  if (params.level) result = result.filter((l) => l.level === params.level);
  if (params.service) result = result.filter((l) => l.service === params.service);
  if (params.query) {
    const q = params.query.toLowerCase();
    result = result.filter((l) => l.message.toLowerCase().includes(q));
  }
  result.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  return paginate(result, params.page ?? 1, params.pageSize ?? 20);
}

export async function suspendUser(id: string) {
  await delay(80, 160);
  const user = mockAdminUsers.find((u) => u.id === id);
  if (!user) throw new Error("User not found");
  user.suspended = true;
  user.status = "suspended";
  user.updatedAt = isoDate(0);
  return { ...user };
}

export async function unsuspendUser(id: string) {
  await delay(80, 160);
  const user = mockAdminUsers.find((u) => u.id === id);
  if (!user) throw new Error("User not found");
  user.suspended = false;
  user.status = "active";
  user.updatedAt = isoDate(0);
  return { ...user };
}

export async function deleteUser(id: string) {
  await delay(80, 160);
  const index = mockAdminUsers.findIndex((u) => u.id === id);
  if (index === -1) throw new Error("User not found");
  const [removed] = mockAdminUsers.splice(index, 1);
  return { id: removed.id };
}

export async function listAIServices() {
  await delay(80, 200);
  return [...mockAIServices];
}

export async function getSystemHealth() {
  const runningWorkers = mockWorkers.filter((w) => w.status === "busy" || w.status === "idle").length;
  return {
    uptimeSeconds: 60 * 60 * 24 * 4 + 3200,
    cpu: 0.42,
    memory: 0.61,
    disk: 0.48,
    network: 0.18,
    activeUsers: 24,
    requestsPerMin: 1200,
    errorsPerMin: 6,
    workers: { total: mockWorkers.length, running: runningWorkers },
    queues: mockQueues.length,
  };
}
