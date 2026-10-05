function base64UrlEncode(input: string): string {
  if (typeof btoa !== "undefined") {
    return btoa(input).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  }
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlDecode(input: string): string {
  const pad = "=".repeat((4 - (input.length % 4)) % 4);
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  if (typeof atob !== "undefined") {
    return atob(normalized);
  }
  return Buffer.from(normalized, "base64").toString();
}

export interface MockJwtPayload {
  sub: string;
  email: string;
  role: "admin" | "member" | "viewer";
  iat: number;
  exp: number;
  scope: string[];
  [key: string]: unknown;
}

export type MockJwtInput = Omit<MockJwtPayload, "iat" | "exp">;

export function mintMockJwt(payload: MockJwtInput, ttlSeconds = 60 * 60): string {
  const header = { alg: "none", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body: MockJwtPayload = {
    ...payload,
    iat: now,
    exp: now + ttlSeconds,
  } as MockJwtPayload;
  return (
    base64UrlEncode(JSON.stringify(header)) +
    "." +
    base64UrlEncode(JSON.stringify(body)) +
    "."
  );
}

export function decodeMockJwt(token: string): MockJwtPayload | null {
  try {
    const [, body] = token.split(".");
    if (!body) return null;
    return JSON.parse(base64UrlDecode(body)) as MockJwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeMockJwt(token);
  if (!payload) return true;
  return payload.exp * 1000 < Date.now();
}
