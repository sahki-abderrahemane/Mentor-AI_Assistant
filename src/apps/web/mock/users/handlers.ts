import { delay } from "../seed";
import { mockUsers } from "./data";
import type { MockUser } from "./data";

export interface ListUsersParams {
  page?: number;
  pageSize?: number;
  query?: string;
  role?: MockUser["role"];
  status?: MockUser["status"];
}

function applyFilters(list: MockUser[], params: ListUsersParams): MockUser[] {
  return list.filter((u) => {
    if (params.role && u.role !== params.role) return false;
    if (params.status && u.status !== params.status) return false;
    if (params.query) {
      const q = params.query.toLowerCase();
      if (
        !u.name.toLowerCase().includes(q) &&
        !u.email.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });
}

export async function listUsers(params: ListUsersParams = {}) {
  await delay(120, 280);
  const filtered = applyFilters(mockUsers, params);
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const slice = filtered.slice(start, start + pageSize);
  return {
    items: slice,
    total: filtered.length,
    page,
    pageSize,
    hasNext: start + pageSize < filtered.length,
    hasPrev: start > 0,
  };
}

export async function getUser(uid: string) {
  await delay(60, 160);
  const user = mockUsers.find((u) => u.id === uid);
  if (!user) throw new Error("User not found");
  return user;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
}

export async function updateUser(uid: string, patch: UpdateUserInput) {
  await delay(120, 260);
  const user = mockUsers.find((u) => u.id === uid);
  if (!user) throw new Error("User not found");
  Object.assign(user, patch);
  return { ...user };
}
