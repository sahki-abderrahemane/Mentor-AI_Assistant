"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService, usersService } from "@/services";
import { useAuthStore } from "@/stores/auth.store";

export const authKeys = {
  me: ["auth", "me"] as const,
  demo: ["auth", "demo"] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => useAuthStore.getState().user,
    initialData: () => useAuthStore.getState().user,
    staleTime: Infinity,
  });
}

export function useDemoCredentials() {
  return useQuery({
    queryKey: authKeys.demo,
    queryFn: () => authService.listDemoCredentials(),
    staleTime: Infinity,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string }) => authService.login(input),
    onSuccess: (session) => {
      queryClient.setQueryData(authKeys.me, session.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; email: string; password: string }) =>
      authService.register(input),
    onSuccess: (session) => {
      queryClient.setQueryData(authKeys.me, session.user);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Parameters<typeof usersService.update>[1];
    }) => usersService.update(id, patch),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { token: string; password: string }) =>
      authService.resetPassword(input),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return async () => {
    await authService.logout();
    queryClient.clear();
  };
}

export function useRehydrateSession() {
  const user = useAuthStore((s) => s.user);
  const tokens = useAuthStore((s) => s.tokens);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user) return;
    const token = (() => {
      try {
        return window.localStorage.getItem("mentorai.access");
      } catch {
        return null;
      }
    })();
    if (token) return;
    if (tokens?.refreshToken) {
      void authService.refresh();
      return;
    }
    if (useAuthStore.persist.hasHydrated()) {
      useAuthStore.getState().logout();
    }
  }, [user, tokens]);
}
