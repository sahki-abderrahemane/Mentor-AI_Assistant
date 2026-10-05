import { delay, paginate } from "../seed";
import { mockNotifications } from "./data";
import type { MockNotification } from "./data";

export interface ListNotificationsParams {
  page?: number;
  pageSize?: number;
  read?: boolean;
  type?: MockNotification["type"];
  severity?: MockNotification["severity"];
}

export async function listNotifications(params: ListNotificationsParams = {}) {
  await delay(120, 240);
  let result = [...mockNotifications];
  if (params.read !== undefined) result = result.filter((n) => n.read === params.read);
  if (params.type) result = result.filter((n) => n.type === params.type);
  if (params.severity) result = result.filter((n) => n.severity === params.severity);
  result.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return paginate(result, params.page ?? 1, params.pageSize ?? 20);
}

export async function markAsRead(nid: string, read: boolean) {
  await delay(40, 120);
  const idx = mockNotifications.findIndex((n) => n.id === nid);
  if (idx < 0) return;
  mockNotifications[idx] = { ...mockNotifications[idx]!, read, updatedAt: new Date().toISOString() };
}

export async function markAllAsRead() {
  await delay(60, 160);
  const now = new Date().toISOString();
  for (let i = 0; i < mockNotifications.length; i++) {
    mockNotifications[i] = { ...mockNotifications[i]!, read: true, updatedAt: now } as MockNotification;
  }
}
