"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    if (useAuthStore.getState().isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [router]);
  if (useAuthStore.getState().isAuthenticated) return null;
  return <>{children}</>;
}
