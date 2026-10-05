import { delay } from "../seed";
import { mockApiKeys, mockIntegrations, mockUserSettings } from "./data";
import type { MockApiKey, MockIntegration, MockUserSettings } from "./data";

export async function getUserSettings() {
  await delay(60, 160);
  return { ...mockUserSettings };
}

export async function updateUserSettings(patch: Partial<MockUserSettings>) {
  await delay(100, 240);
  Object.assign(mockUserSettings, patch);
  return { ...mockUserSettings };
}

export async function listApiKeys() {
  await delay(60, 160);
  return [...mockApiKeys];
}

export async function createApiKey(input: { name: string; scopes: string[] }) {
  await delay(160, 280);
  const key: MockApiKey = {
    id: `key_${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    prefix: "mentor_" + Math.random().toString(36).slice(2, 14),
    scopes: input.scopes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockApiKeys.unshift(key);
  return key;
}

export async function revokeApiKey(id: string) {
  await delay(80, 180);
  const idx = mockApiKeys.findIndex((k) => k.id === id);
  if (idx < 0) return;
  mockApiKeys.splice(idx, 1);
}

export async function listIntegrations() {
  await delay(60, 160);
  return [...mockIntegrations];
}

export async function toggleIntegration(id: string) {
  await delay(100, 220);
  const idx = mockIntegrations.findIndex((i) => i.id === id);
  if (idx < 0) throw new Error("Integration not found");
  mockIntegrations[idx] = {
    ...mockIntegrations[idx]!,
    connected: !mockIntegrations[idx]!.connected,
    updatedAt: new Date().toISOString(),
  } as MockIntegration;
  return mockIntegrations[idx]!;
}
