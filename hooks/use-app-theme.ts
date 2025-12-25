import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

type ThemeMode = "light" | "dark";

const STORAGE_KEYS = {
  theme: "chronel_theme",
  accent: "chronel_accent",
};

export function useAppTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [accent, setAccent] = useState("#356AE6");
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    try {
      const [t, a] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.theme),
        AsyncStorage.getItem(STORAGE_KEYS.accent),
      ]);

      if (t === "light" || t === "dark") setThemeMode(t);
      if (a) setAccent(a);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const dark = themeMode === "dark";

  return {
    ready,
    colors: {
      bg: dark ? "#0F1115" : "#FFFFFF",
      text: dark ? "#F5F7FA" : "#0B0D12",
      subtext: dark ? "#A7B0BF" : "#6B7280",
      border: dark ? "#232733" : "#E5E7EB",
      card: dark ? "#151823" : "#F7F8FB",
      tint: accent,
    },
  };
}
