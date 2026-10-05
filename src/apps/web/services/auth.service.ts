import { decodeMockJwt } from "@/lib/mock-jwt";
import { getApiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

interface MockSessionUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "admin" | "member" | "viewer";
  emailVerified: boolean;
  bio?: string;
  createdAt?: string;
}

interface MockSession {
  user: MockSessionUser;
  accessToken: string;
  refreshToken?: string;
  permissions: string[];
}

function saveSession(session: MockSession) {
  useAuthStore.getState().setSession(
    session.user,
    { accessToken: session.accessToken, refreshToken: session.refreshToken },
    session.permissions,
  );
  try {
    window.localStorage.setItem("mentorai.access", session.accessToken);
  } catch {
    // ignore
  }
}

function clearLocalSession() {
  useAuthStore.getState().logout();
  try {
    window.localStorage.removeItem("mentorai.access");
  } catch {
    // ignore
  }
}

export const authService = {
  async login(input: { email: string; password: string }): Promise<MockSession> {
    const c = getApiClient();
    if (c.kind === "mock") {
      const session = await c.mock.auth.login(input);
      saveSession(session);
      return session;
    }
    const { data } = await c.real.post<MockSession>("/auth/login", input);
    saveSession(data);
    return data;
  },

  async register(input: { name: string; email: string; password: string }): Promise<MockSession> {
    const c = getApiClient();
    if (c.kind === "mock") {
      const session = await c.mock.auth.register(input);
      saveSession(session);
      return session;
    }
    const { data } = await c.real.post<MockSession>("/auth/register", input);
    saveSession(data);
    return data;
  },

  async forgotPassword(email: string) {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.auth.forgotPassword({ email });
    return c.real.post("/auth/forgot-password", { email }).then((r) => r.data);
  },

  async resetPassword(input: { token: string; password: string }) {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.auth.resetPassword(input);
    return c.real.post("/auth/reset-password", input).then((r) => r.data);
  },

  async verifyEmail(token: string) {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.auth.verifyEmail({ token });
    return c.real.post("/auth/verify-email", { token }).then((r) => r.data);
  },

  listDemoCredentials() {
    const c = getApiClient();
    if (c.kind === "mock") return c.mock.auth.listDemoCredentials();
    return [];
  },

  decodeToken(token: string) {
    return decodeMockJwt(token);
  },

  async refresh(): Promise<MockSession | null> {
    if (typeof window === "undefined") return null;
    const c = getApiClient();
    if (c.kind === "mock") return null;
    try {
      const { data } = await c.real.post<{ accessToken: string; refreshToken?: string }>(
        "/auth/refresh",
        {},
        { withCredentials: true },
      );
      const accessToken = data?.accessToken;
      if (!accessToken) return null;
      // Backend /auth/refresh returns only tokens (no user/permissions).
      // Preserve the existing user from the store and update tokens only.
      const state = useAuthStore.getState();
      const user = state.user;
      if (!user) return null;
      try {
        window.localStorage.setItem("mentorai.access", accessToken);
      } catch {
        // ignore
      }
      state.setSession(user, { accessToken, refreshToken: data.refreshToken }, state.permissions);
      return {
        user,
        accessToken,
        refreshToken: data.refreshToken,
        permissions: state.permissions,
      };
    } catch {
      clearLocalSession();
      return null;
    }
  },

  async logout(): Promise<void> {
    const c = getApiClient();
    if (c.kind === "real") {
      try {
        await c.real.post("/auth/logout", {}, { withCredentials: true });
      } catch {
        // best-effort: clear local state regardless
      }
    }
    clearLocalSession();
  },
};
