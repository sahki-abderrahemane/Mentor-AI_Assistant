import { create } from "zustand";

export interface UIState {
  sidebarCollapsed: boolean;
  rightPanelOpen: boolean;
  mobileSidebarOpen: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  setRightPanelOpen: (v: boolean) => void;
  setMobileSidebarOpen: (v: boolean) => void;
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  rightPanelOpen: false,
  mobileSidebarOpen: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  setRightPanelOpen: (v) => set({ rightPanelOpen: v }),
  setMobileSidebarOpen: (v) => set({ mobileSidebarOpen: v }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
}));
