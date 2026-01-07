import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark";

const STORAGE_KEYS = {
  theme: "chronel_theme",
  accent: "chronel_accent",
};

export type AppThemeColors = {
  bg: string;
  text: string;
  subtext: string;
  border: string;
  card: string;
  inputBg: string;
  tint: string;
};

type AppThemeContextValue = {
  ready: boolean;
  themeMode: ThemeMode;
  accent: string;
  colors: AppThemeColors;
  setThemeMode: (t: ThemeMode) => Promise<void>;
  setAccent: (a: string) => Promise<void>;
  reload: () => Promise<void>;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");
  const [accent, setAccentState] = useState("#356AE6");
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setThemeMode = useCallback(async (t: ThemeMode) => {
    setThemeModeState(t);
    await AsyncStorage.setItem(STORAGE_KEYS.theme, t);
  }, []);

  const setAccent = useCallback(async (a: string) => {
    setAccentState(a);
    await AsyncStorage.setItem(STORAGE_KEYS.accent, a);
  }, []);

  const colors = useMemo<AppThemeColors>(() => {
    const dark = themeMode === "dark";
    return {
      bg: dark ? "#0F1115" : "#FFFFFF",
      text: dark ? "#F5F7FA" : "#0B0D12",
      subtext: dark ? "#A7B0BF" : "#6B7280",
      border: dark ? "#232733" : "#E5E7EB",
      card: dark ? "#151823" : "#F7F8FB",
      inputBg: dark ? "#151823" : "#EEF0F4",
      tint: accent,
    };
  }, [themeMode, accent]);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      ready,
      themeMode,
      accent,
      colors,
      setThemeMode,
      setAccent,
      reload: load,
    }),
    [ready, themeMode, accent, colors, setThemeMode, setAccent, load]
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(AppThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used inside <AppThemeProvider>");
  return ctx;
}
