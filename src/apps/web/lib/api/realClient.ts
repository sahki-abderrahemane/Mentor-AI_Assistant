import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { API_URL, USE_MOCK } from "@/lib/constants";

declare global {
  var __MENTORAI_AXIOS__: AxiosInstance | undefined;
}

let inflightRefresh: Promise<boolean> | null = null;

export function readAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("mentorai.access");
  } catch {
    return null;
  }
}

function writeAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("mentorai.access", token);
  } catch {
    // ignore
  }
}

async function refreshOnce(): Promise<boolean> {
  if (inflightRefresh) return inflightRefresh;
  inflightRefresh = (async () => {
    try {
      const res = await axios.post<{ accessToken?: string; user?: unknown; permissions?: string[] }>(
        `${API_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );
      const token = res.data?.accessToken;
      if (!token) return false;
      writeAccessToken(token);
      return true;
    } catch {
      return false;
    } finally {
      inflightRefresh = null;
    }
  })();
  return inflightRefresh;
}

function hardLogout(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem("mentorai.access");
    window.localStorage.removeItem("mentorai.auth");
  } catch {
    // ignore
  }
  if (typeof window.location !== "undefined" && !window.location.pathname.startsWith("/login")) {
    window.location.assign("/login");
  }
}

export function getRealClient(): AxiosInstance {
  if (globalThis.__MENTORAI_AXIOS__) return globalThis.__MENTORAI_AXIOS__;
  const instance = axios.create({
    baseURL: API_URL,
    timeout: 30_000,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (typeof window !== "undefined") {
    instance.interceptors.request.use((config) => {
      const token = readAccessToken();
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }
  instance.interceptors.response.use(
    (r) => r,
    async (err) => {
      const status = err?.response?.status;
      const config = err?.config as (InternalAxiosRequestConfig & { __retried?: boolean }) | undefined;
      if (status === 401 && config && !config.__retried && typeof window !== "undefined") {
        const url = config.url ?? "";
        if (url.includes("/auth/")) {
          return Promise.reject(err);
        }
        config.__retried = true;
        const ok = await refreshOnce();
        if (ok) {
          const token = readAccessToken();
          if (token) {
            config.headers = config.headers ?? {};
            (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
          }
          return instance(config);
        }
        hardLogout();
      }
      return Promise.reject(err);
    },
  );
  if (typeof window !== "undefined") {
    globalThis.__MENTORAI_AXIOS__ = instance;
  }
  return instance;
}

export function isMockMode(): boolean {
  return USE_MOCK;
}
