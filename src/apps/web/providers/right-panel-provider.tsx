"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface RightPanelContent {
  key: string;
  title?: string;
  description?: string;
  render?: () => ReactNode;
  defaultOpen?: boolean;
  width?: "sm" | "md" | "lg" | "xl";
}

interface RightPanelContextValue {
  open: boolean;
  content: RightPanelContent | null;
  show: (content: RightPanelContent) => void;
  hide: () => void;
  toggle: () => void;
  set: (content: RightPanelContent | null) => void;
}

const RightPanelContext = createContext<RightPanelContextValue | null>(null);

export function RightPanelProvider({
  children,
  defaultContent,
}: {
  children: ReactNode;
  defaultContent?: RightPanelContent | null;
}) {
  const [open, setOpen] = useState(Boolean(defaultContent?.defaultOpen ?? false));
  const [content, setContent] = useState<RightPanelContent | null>(
    defaultContent ?? null
  );

  const show = useCallback((c: RightPanelContent) => {
    setContent(c);
    setOpen(true);
  }, []);

  const hide = useCallback(() => setOpen(false), []);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  const set = useCallback((c: RightPanelContent | null) => {
    setContent(c);
    if (c) setOpen(true);
  }, []);

  const value = useMemo(
    () => ({ open, content, show, hide, toggle, set }),
    [open, content, show, hide, toggle, set]
  );

  return (
    <RightPanelContext.Provider value={value}>
      {children}
    </RightPanelContext.Provider>
  );
}

export function useRightPanel() {
  const ctx = useContext(RightPanelContext);
  if (!ctx) {
    throw new Error("useRightPanel must be used within RightPanelProvider");
  }
  return ctx;
}
