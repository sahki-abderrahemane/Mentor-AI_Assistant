import { delay, paginate } from "../seed";
import { mockProjects } from "./data";
import type { MockProject } from "./data";

export interface ListProjectsParams {
  page?: number;
  pageSize?: number;
  query?: string;
  starred?: boolean;
  archived?: boolean;
  tag?: string;
}

export async function listProjects(params: ListProjectsParams = {}) {
  await delay(120, 260);
  let result = [...mockProjects];
  if (params.starred !== undefined) {
    result = result.filter((p) => p.starred === params.starred);
  }
  if (params.archived !== undefined) {
    result = result.filter((p) => p.archived === params.archived);
  }
  if (params.tag) {
    result = result.filter((p) => p.tags?.includes(params.tag!));
  }
  if (params.query) {
    const q = params.query.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  return paginate(result, params.page ?? 1, params.pageSize ?? 20);
}

export async function getProject(pid: string) {
  await delay(80, 200);
  const project = mockProjects.find((p) => p.id === pid);
  if (!project) throw new Error("Project not found");
  return project;
}

export async function createProject(input: Partial<MockProject>) {
  await delay(160, 320);
  const now = new Date().toISOString();
  const project: MockProject = {
    id: `prj_${Math.random().toString(36).slice(2, 8)}`,
    name: input.name ?? "Untitled project",
    description: input.description ?? "",
    color: input.color ?? "#7c3aed",
    icon: input.icon ?? "Sparkles",
    ownerId: "usr_current",
    ownerName: "You",
    memberIds: input.memberIds ?? [],
    collectionCount: 0,
    documentCount: 0,
    conversationCount: 0,
    starred: false,
    archived: false,
    lastActivityAt: now,
    createdAt: now,
    updatedAt: now,
    tags: input.tags ?? [],
  };
  mockProjects.unshift(project);
  return project;
}

export async function updateProject(pid: string, patch: Partial<MockProject>) {
  await delay(80, 200);
  const idx = mockProjects.findIndex((p) => p.id === pid);
  if (idx < 0) throw new Error("Project not found");
  const current = mockProjects[idx]!;
  const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
  mockProjects[idx] = updated;
  return updated;
}

export async function deleteProject(pid: string) {
  await delay(80, 200);
  const idx = mockProjects.findIndex((p) => p.id === pid);
  if (idx < 0) return;
  mockProjects.splice(idx, 1);
}
