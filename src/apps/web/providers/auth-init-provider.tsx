"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useRehydrateSession } from "@/features/auth/hooks/useAuth";

function subscribe(cb: () => void) {
  return useAuthStore.persist.onFinishHydration(cb);
}

function getSnapshot() {
  return useAuthStore.persist.hasHydrated();
}

function getServerSnapshot() {
  return false;
}

function SessionRehydrator() {
  useRehydrateSession();
  return null;
}

export function AuthInitProvider({ children }: { children: ReactNode }) {
  const hydrated = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!hydrated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SessionRehydrator />
      {children}
    </>
  );
}
