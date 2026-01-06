import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark";

const STORAGE_KEYS = {
  theme: "chronel_theme",
  accent: "chronel_accent",
};

type AppThemeColors = {
  bg: string;
  text: string;
  subtext: string;
  border: string;
  card: string;
  surface: string;
  inputBg: string; // ✅ added
  tint: string; // your accent
  accent: string; // same as tint (handy)
};

type AppThemeContextValue = {
  ready: boolean;
  themeMode: ThemeMode;
  accent: string;
  colors: AppThemeColors;
  setThemeMode: (t: ThemeMode) => void;
  setAccent: (a: string) => void;
  reload: () => Promise<void>;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");
  const [accent, setAccentState] = useState("#356AE6");

  const reload = async () => {
    try {
      const [t, a] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.theme),
        AsyncStorage.getItem(STORAGE_KEYS.accent),
      ]);
      if (t === "light" || t === "dark") setThemeModeState(t);
      if (a) setAccentState(a);
    } finally {
      setReady(true);
    }
  };

  // Load once on app start (critical for web reload + splash)
  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist when changes happen (after initial load)
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEYS.theme, themeMode);
  }, [themeMode, ready]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEYS.accent, accent);
  }, [accent, ready]);

  const colors: AppThemeColors = useMemo(() => {
    const dark = themeMode === "dark";
    return {
      bg: dark ? "#0F1115" : "#FFFFFF",
      text: dark ? "#F5F7FA" : "#0B0D12",
      subtext: dark ? "#A7B0BF" : "#6B7280",
      border: dark ? "#232733" : "#E5E7EB",
      card: dark ? "#151823" : "#F7F8FB",
      surface: dark ? "#121521" : "#FFFFFF",
      inputBg: dark ? "#151823" : "#EEF0F4", // ✅ added
      tint: accent,
      accent,
    };
  }, [themeMode, accent]);

  const setThemeMode = (t: ThemeMode) => setThemeModeState(t);
  const setAccent = (a: string) => setAccentState(a);

  const value: AppThemeContextValue = {
    ready,
    themeMode,
    accent,
    colors,
    setThemeMode,
    setAccent,
    reload,
  };

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(AppThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within AppThemeProvider");
  return ctx;
}
