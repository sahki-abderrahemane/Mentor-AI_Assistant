import {
  listUsers as mockListUsers,
  updateUser as mockUpdateUser,
} from "@/mock/users/handlers";
import { getApiClient } from "@/lib/api";

export const usersService = {
  list: (params?: Parameters<typeof mockListUsers>[0]) => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.users.listUsers(params ?? {});
    return c.real.get("/users", { params }).then((r) => r.data);
  },
  get: (id: string) => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.users.getUser(id);
    return c.real.get(`/users/${id}`).then((r) => r.data);
  },
  update: (id: string, data: Parameters<typeof mockUpdateUser>[1]) => {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.users.updateUser(id, data);
    return c.real.patch(`/users/${id}`, data).then((r) => r.data);
  },
};
