import { decodeMockJwt, mintMockJwt } from "@/lib/mock-jwt";

export interface MockAuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    role: "admin" | "member" | "viewer";
    emailVerified: boolean;
    bio: string;
    createdAt: string;
  };
  accessToken: string;
  refreshToken?: string;
  permissions: string[];
}

const demoUsers = [
  {
    id: "usr_current",
    name: "Abderrahemane Sahki",
    email: "you@mentorai.dev",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=AS&backgroundColor=7c3aed",
    role: "admin" as const,
    emailVerified: true,
    bio: "Building MentorAI — research notebooks, RAG pipelines, and QLoRA experiments.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr_demo_admin",
    name: "Hana Mendez",
    email: "hana@mentorai.dev",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=HM&backgroundColor=0891b2",
    role: "admin" as const,
    emailVerified: true,
    bio: "Head of evaluation.",
    createdAt: new Date(Date.now() - 30 * 86_400_000).toISOString(),
  },
  {
    id: "usr_demo_member",
    name: "Maaz Idris",
    email: "maaz@mentorai.dev",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=MI&backgroundColor=059669",
    role: "member" as const,
    emailVerified: true,
    bio: "ML engineer focused on retrieval-augmented generation.",
    createdAt: new Date(Date.now() - 60 * 86_400_000).toISOString(),
  },
];

const allPermissions = [
  "documents.read",
  "documents.write",
  "documents.delete",
  "collections.write",
  "projects.write",
  "chat.send",
  "training.run",
  "models.manage",
  "admin.access",
];

function mintSession(userIndex = 0): MockAuthSession {
  const u = demoUsers[userIndex] ?? demoUsers[0]!;
  const accessToken = mintMockJwt(
    {
      sub: u.id,
      email: u.email,
      role: u.role,
      scope: u.role === "admin" ? allPermissions : allPermissions.filter((p) => p !== "admin.access"),
    },
    60 * 60
  );
  return {
    user: u,
    accessToken,
    refreshToken: mintMockJwt({ sub: u.id, email: u.email, role: u.role, scope: [] }, 60 * 60 * 24 * 7),
    permissions: u.role === "admin" ? allPermissions : allPermissions.filter((p) => p !== "admin.access"),
  };
}

export const login = async (input: { email: string; password: string }): Promise<MockAuthSession> => {
  await new Promise((r) => setTimeout(r, 380));
  const email = input.email.toLowerCase().trim();
  const match = demoUsers.findIndex((u) => u.email === email);
  if (match === -1) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || input.password.length < 6) {
      throw new Error("Invalid email or password (demo accepts any valid email + 6+ char password).");
    }
    return mintSession(0);
  }
  if (input.password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
  return mintSession(match);
};

export const register = async (input: {
  name: string;
  email: string;
  password: string;
}): Promise<MockAuthSession> => {
  await new Promise((r) => setTimeout(r, 420));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    throw new Error("Invalid email address.");
  }
  if (input.password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
  demoUsers[0] = {
    ...demoUsers[0]!,
    name: input.name || demoUsers[0]!.name,
    email: input.email.toLowerCase(),
  };
  return mintSession(0);
};

export const forgotPassword = async (input: { email: string }) => {
  await new Promise((r) => setTimeout(r, 220));
  return { ok: true, email: input.email };
};

export const resetPassword = async (input: { token: string; password: string }) => {
  await new Promise((r) => setTimeout(r, 220));
  if (input.password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
  return { ok: true };
};

export const verifyEmail = async (input: { token: string }) => {
  await new Promise((r) => setTimeout(r, 220));
  const decoded = decodeMockJwt(input.token);
  return { ok: true, email: decoded?.email ?? "you@mentorai.dev" };
};

export const listDemoCredentials = () =>
  demoUsers.map((u) => ({
    name: u.name,
    email: u.email,
    role: u.role,
  }));
