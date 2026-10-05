import {
  createApiKey as mockCreateKey,
  getUserSettings as mockGetSettings,
  listApiKeys as mockListKeys,
  listIntegrations as mockListIntegrations,
  revokeApiKey as mockRevokeKey,
  toggleIntegration as mockToggleInt,
  updateUserSettings as mockUpdateSettings,
} from "@/mock/settings/handlers";
import { getApiClient } from "@/lib/api";

export const settingsService = {
  get: () => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.settings.getUserSettings();
    return c.real.get("/settings").then((r) => r.data);
  },
  update: (patch: Parameters<typeof mockUpdateSettings>[0]) => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.settings.updateUserSettings(patch);
    return c.real.patch("/settings", patch).then((r) => r.data);
  },
  apiKeys: {
    list: () => {
      const c = getApiClient();
      if (c.kind === "mock") return c.mock.settings.listApiKeys();
      return c.real.get("/settings/api-keys").then((r) => r.data);
    },
    create: (input: Parameters<typeof mockCreateKey>[0]) => {
      const c = getApiClient();
      if (c.kind === "mock") return c.mock.settings.createApiKey(input);
      return c.real.post("/settings/api-keys", input).then((r) => r.data);
    },
    revoke: (id: string) => {
      const c = getApiClient();
      if (c.kind === "mock") return c.mock.settings.revokeApiKey(id);
      return c.real.delete(`/settings/api-keys/${id}`).then((r) => r.data);
    },
  },
  integrations: {
    list: () => {
      const c = getApiClient();
      if (c.kind === "mock") return c.mock.settings.listIntegrations();
      return c.real.get("/settings/integrations").then((r) => r.data);
    },
    toggle: (id: string) => {
      const c = getApiClient();
      if (c.kind === "mock") return c.mock.settings.toggleIntegration(id);
      return c.real.post(`/settings/integrations/${id}/toggle`).then((r) => r.data);
    },
  },
};

void mockGetSettings;
void mockListKeys;
void mockListIntegrations;
void mockRevokeKey;
void mockToggleInt;
