import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface PreferencesState {
  theme: "light" | "dark" | "system";
  density: "comfortable" | "compact";
  language: string;
  darkMode: boolean;
  compactMode: boolean;
  showLineNumbers: boolean;
  streamResponses: boolean;
  showCitations: boolean;
  setTheme: (v: "light" | "dark" | "system") => void;
  setDensity: (v: "comfortable" | "compact") => void;
  setLanguage: (v: string) => void;
  setDarkMode: (v: boolean) => void;
  setCompactMode: (v: boolean) => void;
  setShowLineNumbers: (v: boolean) => void;
  setStreamResponses: (v: boolean) => void;
  setShowCitations: (v: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: "system",
      density: "comfortable",
      language: "en",
      darkMode: false,
      compactMode: false,
      showLineNumbers: true,
      streamResponses: true,
      showCitations: true,
      setTheme: (v) => set({ theme: v }),
      setDensity: (v) => set({ density: v }),
      setLanguage: (v) => set({ language: v }),
      setDarkMode: (v) => set({ darkMode: v }),
      setCompactMode: (v) => set({ compactMode: v }),
      setShowLineNumbers: (v) => set({ showLineNumbers: v }),
      setStreamResponses: (v) => set({ streamResponses: v }),
      setShowCitations: (v) => set({ showCitations: v }),
    }),
    {
      name: "mentorai.preferences",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
