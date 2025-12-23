import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

/* -------------------- Types -------------------- */

type ThemeMode = "light" | "dark";

type SettingsState = {
  aiSuggestions: boolean;
  intervalCheckins: boolean;
  notifications: boolean;
  calendarSync: boolean;
  screenTimeAccess: boolean;
};

/* -------------------- Constants -------------------- */

const STORAGE_KEYS = {
  theme: "chronel_theme",
  accent: "chronel_accent",
  settings: "chronel_settings",
};

const ACCENT_OPTIONS = [
  "#356AE6",
  "#7C3AED",
  "#22C55E",
  "#F97316",
  "#EC4899",
  "#14B8A6",
];

/* -------------------- Screen -------------------- */

export default function SettingsScreen() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [accent, setAccent] = useState<string>(ACCENT_OPTIONS[0]);

  const [settings, setSettings] = useState<SettingsState>({
    aiSuggestions: true,
    intervalCheckins: false,
    notifications: true,
    calendarSync: false,
    screenTimeAccess: false,
  });

  const colors = useMemo(() => {
    const dark = theme === "dark";
    return {
      bg: dark ? "#0F1115" : "#FFFFFF",
      text: dark ? "#F5F7FA" : "#0B0D12",
      subtext: dark ? "#A7B0BF" : "#6B7280",
      border: dark ? "#232733" : "#E5E7EB",
      card: dark ? "#151823" : "#F7F8FB",
      surface: dark ? "#121521" : "#FFFFFF",
      accent,
      danger: "#C83737",
    };
  }, [theme, accent]);

  /* -------------------- Persistence -------------------- */

  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem(STORAGE_KEYS.theme);
      const a = await AsyncStorage.getItem(STORAGE_KEYS.accent);
      const s = await AsyncStorage.getItem(STORAGE_KEYS.settings);
      if (t === "light" || t === "dark") setTheme(t);
      if (a) setAccent(a);
      if (s) setSettings(JSON.parse(s));
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.accent, accent);
  }, [accent]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  }, [settings]);

  /* -------------------- Handlers -------------------- */

  const updateSetting = (key: keyof SettingsState, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const confirmClearAll = () => {
    Alert.alert(
      "Clear All Data",
      "This will remove all local data on this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
          },
        },
      ]
    );
  };

  /* -------------------- Render -------------------- */

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.container}
      testID="settings_scrollView_01"
    >
      {/* Header */}
      <Text style={[styles.title, { color: colors.text }]} testID="settings_header_titleTxt_01">
        Settings
      </Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]} testID="settings_header_subtitleTxt_01">
        Customize your experience
      </Text>

      {/* Features */}
      <Text style={[styles.sectionTitle, { color: colors.text }]} testID="settings_features_titleTxt_01">
        Features
      </Text>

      <View style={[styles.card, { borderColor: colors.border }]} testID="settings_features_card_01">
        <ToggleRow
          id="settings_aiSuggestions"
          title="AI Suggestions"
          subtitle="Get personalized insights and tips"
          value={settings.aiSuggestions}
          onChange={(v) => updateSetting("aiSuggestions", v)}
          colors={colors}
        />
        <ToggleRow
          id="settings_intervalCheckins"
          title="Interval Check-ins"
          subtitle="Track your day in time intervals"
          value={settings.intervalCheckins}
          onChange={(v) => updateSetting("intervalCheckins", v)}
          colors={colors}
        />
        <ToggleRow
          id="settings_notifications"
          title="Notifications"
          subtitle="Reminders for check-ins"
          value={settings.notifications}
          onChange={(v) => updateSetting("notifications", v)}
          colors={colors}
        />
        <ToggleRow
          id="settings_calendarSync"
          title="Calendar Sync"
          subtitle="Add tasks to your device calendar"
          value={settings.calendarSync}
          onChange={(v) => updateSetting("calendarSync", v)}
          colors={colors}
        />
        <ToggleRow
          id="settings_screenTime"
          title="Screen Time Access"
          subtitle="Correlate usage with well-being"
          value={settings.screenTimeAccess}
          onChange={(v) => updateSetting("screenTimeAccess", v)}
          colors={colors}
        />
      </View>

      {/* Appearance */}
      <Text style={[styles.sectionTitle, { color: colors.text }]} testID="settings_appearance_titleTxt_01">
        Appearance
      </Text>

      <Text style={[styles.label, { color: colors.text }]} testID="settings_theme_labelTxt_01">
        Theme
      </Text>

      <View style={styles.themeRow} testID="settings_theme_row_01">
        <ThemeCard
          id="settings_theme_light"
          label="Light"
          icon="sunny-outline"
          selected={theme === "light"}
          onPress={() => setTheme("light")}
          colors={colors}
        />
        <ThemeCard
          id="settings_theme_dark"
          label="Dark"
          icon="moon-outline"
          selected={theme === "dark"}
          onPress={() => setTheme("dark")}
          colors={colors}
        />
      </View>

      {/* Accent Colors */}
      <Text style={[styles.label, { color: colors.text }]} testID="settings_accent_labelTxt_01">
        Accent Color
      </Text>

      <View style={styles.accentRow} testID="settings_accent_row_01">
        {ACCENT_OPTIONS.map((c, i) => (
          <Pressable
            key={c}
            onPress={() => setAccent(c)}
            style={[styles.accentDot, { backgroundColor: c }]}
            testID={`settings_accent_dot_${i + 1}_01`}
          >
            {accent === c && (
              <Ionicons
                name="checkmark"
                size={22}
                color="#FFF"
                testID={`settings_accent_check_${i + 1}_01`}
              />
            )}
          </Pressable>
        ))}
      </View>

      {/* Privacy */}
      <Text style={[styles.sectionTitle, { color: colors.text }]} testID="settings_privacy_titleTxt_01">
        Privacy
      </Text>

      <View style={[styles.privacyCard, { borderColor: colors.border }]} testID="settings_privacy_card_01">
        <Ionicons name="shield-checkmark-outline" size={22} color={colors.accent} testID="settings_privacy_icon_01" />
        <Text style={[styles.privacyText, { color: colors.subtext }]} testID="settings_privacy_bodyTxt_01">
          Your data is stored locally on your device. We never have access to your personal information.
        </Text>
      </View>

      {/* Clear Data */}
      <Pressable
        onPress={confirmClearAll}
        style={[styles.clearButton, { backgroundColor: colors.danger }]}
        testID="settings_clearData_button_01"
      >
        <Text style={styles.clearButtonText} testID="settings_clearData_text_01">
          Clear All Data
        </Text>
      </Pressable>
    </ScrollView>
  );
}

/* -------------------- Subcomponents -------------------- */

function ToggleRow({
  id,
  title,
  subtitle,
  value,
  onChange,
  colors,
}: {
  id: string;
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (v: boolean) => void;
  colors: any;
}) {
  return (
    <View style={styles.toggleRow} testID={`${id}_row_01`}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.toggleTitle, { color: colors.text }]} testID={`${id}_titleTxt_01`}>
          {title}
        </Text>
        <Text style={[styles.toggleSubtitle, { color: colors.subtext }]} testID={`${id}_subtitleTxt_01`}>
          {subtitle}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#E5E7EB", true: colors.accent }}
        testID={`${id}_switch_01`}
      />
    </View>
  );
}

function ThemeCard({
  id,
  label,
  icon,
  selected,
  onPress,
  colors,
}: {
  id: string;
  label: string;
  icon: any;
  selected: boolean;
  onPress: () => void;
  colors: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.themeCard,
        { borderColor: selected ? colors.accent : colors.border },
      ]}
      testID={`${id}_card_01`}
    >
      <Ionicons name={icon} size={26} color={colors.text} testID={`${id}_icon_01`} />
      <Text style={[styles.themeLabel, { color: colors.text }]} testID={`${id}_labelTxt_01`}>
        {label}
      </Text>
    </Pressable>
  );
}

/* -------------------- Styles -------------------- */

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 40, fontWeight: "800" },
  subtitle: { fontSize: 18, marginBottom: 16 },

  sectionTitle: { fontSize: 22, fontWeight: "800", marginTop: 24, marginBottom: 12 },
  label: { fontSize: 18, fontWeight: "700", marginTop: 12, marginBottom: 8 },

  card: { borderWidth: 1, borderRadius: 18 },

  toggleRow: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  toggleTitle: { fontSize: 18, fontWeight: "700" },
  toggleSubtitle: { fontSize: 14, marginTop: 4 },

  themeRow: { flexDirection: "row", gap: 12 },
  themeCard: {
    flex: 1,
    padding: 20,
    borderRadius: 18,
    borderWidth: 3,
    alignItems: "center",
  },
  themeLabel: { marginTop: 8, fontSize: 18, fontWeight: "700" },

  accentRow: { flexDirection: "row", gap: 16 },
  accentDot: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  privacyCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    gap: 12,
  },
  privacyText: { flex: 1, fontSize: 14, lineHeight: 20 },

  clearButton: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  clearButtonText: { color: "#FFF", fontSize: 18, fontWeight: "800" },
});
