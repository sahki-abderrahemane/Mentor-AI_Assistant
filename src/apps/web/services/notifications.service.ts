import {
  listNotifications as mockList,
  markAllAsRead as mockMarkAll,
  markAsRead as mockMark,
} from "@/mock/notifications/handlers";
import { getApiClient } from "@/lib/api";

export const notificationsService = {
  list: (params?: { page?: number; pageSize?: number; unreadOnly?: boolean }) => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.notifications.listNotifications((params ?? {}) as never);
    return c.real.get("/notifications", { params }).then((r) => r.data);
  },
  unreadCount: () => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.notifications.listNotifications({ pageSize: 1, unreadOnly: true } as never).then((r: { items: unknown[] }) => r.items.length);
    return c.real.get("/notifications/unread-count").then((r) => r.data);
  },
  markRead: (id: string, _read = true) => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.notifications.markAsRead(id, true);
    return c.real.post(`/notifications/${id}/read`, {}).then((r) => r.data);
  },
  markAllRead: () => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.notifications.markAllAsRead();
    return c.real.post("/notifications/read-all").then((r) => r.data);
  },
};
