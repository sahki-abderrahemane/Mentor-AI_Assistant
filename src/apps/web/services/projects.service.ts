import {
  createProject as mockCreateProject,
  deleteProject as mockDeleteProject,
  getProject as mockGetProject,
  listProjects as mockListProjects,
  updateProject as mockUpdateProject,
} from "@/mock/projects/handlers";
import {
  createCollection as mockCreateCollection,
  deleteCollection as mockDeleteCollection,
  getCollection as mockGetCollection,
  listCollections as mockListCollections,
  updateCollection as mockUpdateCollection,
} from "@/mock/collections/handlers";
import { getApiClient } from "@/lib/api";

export const projectsService = {
  list: (params?: Parameters<typeof mockListProjects>[0]) => {
    const client = getApiClient();
    if (client.kind === "mock") return client.mock.projects.listProjects(params ?? {});
    return client.real.get("/projects", { params }).then((r) => r.data);
  },
  get: (id: string) => {
    const client = getApiClient();
    if (client.kind === "mock") return client.mock.projects.getProject(id);
    return client.real.get(`/projects/${id}`).then((r) => r.data);
  },
  create: (input: Parameters<typeof mockCreateProject>[0]) => {
    const client = getApiClient();
    if (client.kind === "mock") return client.mock.projects.createProject(input);
    return client.real.post("/projects", input).then((r) => r.data);
  },
  update: (id: string, patch: Parameters<typeof mockUpdateProject>[1]) => {
    const client = getApiClient();
    if (client.kind === "mock") return client.mock.projects.updateProject(id, patch);
    return client.real.patch(`/projects/${id}`, patch).then((r) => r.data);
  },
  remove: (id: string) => {
    const client = getApiClient();
    if (client.kind === "mock") return client.mock.projects.deleteProject(id);
    return client.real.delete(`/projects/${id}`).then((r) => r.data);
  },
};

export const collectionsService = {
  list: (params?: Parameters<typeof mockListCollections>[0]) => {
    const client = getApiClient();
    if (client.kind === "mock") return client.mock.collections.listCollections(params ?? {});
    return client.real.get("/collections", { params }).then((r) => r.data);
  },
  get: (id: string) => {
    const client = getApiClient();
    if (client.kind === "mock") return client.mock.collections.getCollection(id);
    return client.real.get(`/collections/${id}`).then((r) => r.data);
  },
  create: (input: Parameters<typeof mockCreateCollection>[0]) => {
    const client = getApiClient();
    if (client.kind === "mock") return client.mock.collections.createCollection(input);
    return client.real.post("/collections", input).then((r) => r.data);
  },
  update: (id: string, patch: Parameters<typeof mockUpdateCollection>[1]) => {
    const client = getApiClient();
    if (client.kind === "mock") return client.mock.collections.updateCollection(id, patch);
    return client.real.patch(`/collections/${id}`, patch).then((r) => r.data);
  },
  remove: (id: string) => {
    const client = getApiClient();
    if (client.kind === "mock") return client.mock.collections.deleteCollection(id);
    return client.real.delete(`/collections/${id}`).then((r) => r.data);
  },
};
