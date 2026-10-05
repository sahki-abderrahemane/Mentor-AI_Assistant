"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!useAuthStore.getState().isAuthenticated) {
      const next = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
    }
  }, [router, pathname]);
  if (!useAuthStore.getState().isAuthenticated) return null;
  return <>{children}</>;
}
