import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserRole = "admin" | "member" | "viewer";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  emailVerified: boolean;
  bio?: string;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  permissions: string[];
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (user: AuthUser, tokens: AuthTokens, permissions?: string[]) => void;
  updateUser: (patch: Partial<AuthUser>) => void;
  setUser: (user: AuthUser) => void;
  setPermissions: (permissions: string[]) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      permissions: [],
      isAuthenticated: false,
      isHydrated: false,
      setSession: (user, tokens, permissions = []) =>
        set({
          user,
          tokens,
          permissions,
          isAuthenticated: true,
        }),
      updateUser: (patch) =>
        set((state) =>
          state.user
            ? { user: { ...state.user, ...patch }, isAuthenticated: true }
            : state
        ),
      setUser: (user) =>
        set({ user, isAuthenticated: true }),
      setPermissions: (permissions) => set({ permissions }),
      logout: () =>
        set({
          user: null,
          tokens: null,
          permissions: [],
          isAuthenticated: false,
        }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "mentorai.auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
