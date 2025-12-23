import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

type ThemeMode = "light" | "dark";

const STORAGE_KEYS = {
  theme: "chronel_theme",
  accent: "chronel_accent",
  settings: "chronel_settings",
};

type AppSettings = {
  aiSuggestions: boolean;
  intervalCheckins: boolean;
  notifications: boolean;
  calendarSync: boolean;
  screenTimeAccess: boolean;
};

type TrendKey = "Mood" | "Energy" | "Stress" | "Fulfillment";

type TrendCardData = {
  key: TrendKey;
  value: number;
  iconName: any;
  iconColor: string;
};

const DEFAULT_TRENDS: TrendCardData[] = [
  { key: "Mood", value: 3.8, iconName: "happy-outline", iconColor: "#2F8F83" },
  { key: "Energy", value: 3.2, iconName: "flash-outline", iconColor: "#D69E2E" },
  { key: "Stress", value: 2.9, iconName: "sad-outline", iconColor: "#C83737" },
  { key: "Fulfillment", value: 3.5, iconName: "sparkles-outline", iconColor: "#2F8F83" },
];

const DEFAULT_BLOCKERS = ["Distractions", "Low energy", "Unclear goals", "Procrastination"];

export default function InsightsScreen() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [accent, setAccent] = useState<string>("#356AE6");
  const [settings, setSettings] = useState<AppSettings>({
    aiSuggestions: true,
    intervalCheckins: false,
    notifications: true,
    calendarSync: false,
    screenTimeAccess: false,
  });

  // Load Appearance + Settings from AsyncStorage (same keys as Settings screen)
  useEffect(() => {
    (async () => {
      try {
        const [t, a, s] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.theme),
          AsyncStorage.getItem(STORAGE_KEYS.accent),
          AsyncStorage.getItem(STORAGE_KEYS.settings),
        ]);

        if (t === "light" || t === "dark") setTheme(t);
        if (a) setAccent(a);
        if (s) setSettings(JSON.parse(s));
      } catch {
        // ignore
      }
    })();

    // Also re-load whenever the tab is revisited (cheap polling approach)
    // If you later want: useFocusEffect from @react-navigation/native
    const interval = setInterval(async () => {
      try {
        const [t, a, s] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.theme),
          AsyncStorage.getItem(STORAGE_KEYS.accent),
          AsyncStorage.getItem(STORAGE_KEYS.settings),
        ]);
        if (t === "light" || t === "dark") setTheme(t);
        if (a) setAccent(a);
        if (s) setSettings(JSON.parse(s));
      } catch {}
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const colors = useMemo(() => {
    const dark = theme === "dark";
    return {
      bg: dark ? "#0F1115" : "#FFFFFF",
      text: dark ? "#F5F7FA" : "#0B0D12",
      subtext: dark ? "#A7B0BF" : "#6B7280",
      border: dark ? "#232733" : "#E5E7EB",
      card: dark ? "#151823" : "#FFFFFF",
      softCard: dark ? "#151823" : "#F7F8FB",
      accent,
      chipText: "#FFFFFF",
      streakBg: dark ? "#141824" : "#F2F6FF",
    };
  }, [theme, accent]);

  // Fake data for now (wire later from check-ins)
  const trends = DEFAULT_TRENDS;
  const blockers = DEFAULT_BLOCKERS;
  const streakCount = 7;

  // Example: Suggested Focus can react to settings toggles too
  const suggestedFocusText = useMemo(() => {
    // If interval tracking is on, nudge more granular planning
    if (settings.intervalCheckins) {
      return "You enabled interval check-ins. Try planning your day in 2–3 focused blocks and doing a quick mid-block check-in.";
    }
    return "Your energy levels are highest in the morning. Consider scheduling important tasks before noon for better productivity.";
  }, [settings.intervalCheckins]);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
      testID="insights_scrollView_01"
    >
      {/* Header */}
      <Text style={[styles.title, { color: colors.text }]} testID="insights_header_titleTxt_01">
        Insights
      </Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]} testID="insights_header_subtitleTxt_01">
        Your weekly trends and patterns
      </Text>

      {/* Weekly Trends */}
      <Text style={[styles.sectionTitle, { color: colors.text }]} testID="insights_weekly_titleTxt_01">
        Weekly Trends
      </Text>

      <View style={styles.grid} testID="insights_weekly_grid_01">
        {trends.map((t, idx) => (
          <TrendCard
            key={t.key}
            colors={colors}
            title={t.key}
            value={t.value}
            iconName={t.iconName}
            iconColor={t.iconColor}
            cardIndex={idx + 1}
          />
        ))}
      </View>

      {/* Consistency Streak */}
      <View
        style={[
          styles.streakCard,
          {
            borderColor: colors.border,
            backgroundColor: colors.streakBg,
          },
        ]}
        testID="insights_streak_card_01"
      >
        <View style={styles.streakHeader} testID="insights_streak_header_01">
          <View style={{ flex: 1 }} testID="insights_streak_headerLeft_01">
            <Text style={[styles.streakTitle, { color: colors.text }]} testID="insights_streak_titleTxt_01">
              Consistency Streak
            </Text>
            <Text style={[styles.streakSub, { color: colors.subtext }]} testID="insights_streak_subtitleTxt_01">
              Keep it up!
            </Text>
          </View>

          <Text style={[styles.streakCount, { color: colors.accent }]} testID="insights_streak_countTxt_01">
            {streakCount}
          </Text>
        </View>

        <View style={styles.streakBars} testID="insights_streak_barsRow_01">
          {Array.from({ length: 7 }).map((_, i) => (
            <View
              key={i}
              style={[styles.streakBar, { backgroundColor: colors.accent }]}
              testID={`insights_streak_bar_${i + 1}_01`}
            />
          ))}
        </View>
      </View>

      {/* Common Blockers */}
      <Text style={[styles.sectionTitle, { color: colors.text }]} testID="insights_blockers_titleTxt_01">
        Common Blockers
      </Text>

      <View style={styles.chipWrap} testID="insights_blockers_chipWrap_01">
        {blockers.map((b, idx) => (
          <Chip
            key={b}
            label={b}
            colors={colors}
            index={idx + 1}
          />
        ))}
      </View>

      {/* Suggested Focus */}
      <View
        style={[
          styles.focusCard,
          { borderColor: colors.border, backgroundColor: colors.card },
        ]}
        testID="insights_focus_card_01"
      >
        <Text style={[styles.focusTitle, { color: colors.text }]} testID="insights_focus_titleTxt_01">
          Suggested Focus
        </Text>
        <Text style={[styles.focusBody, { color: colors.subtext }]} testID="insights_focus_bodyTxt_01">
          {suggestedFocusText}
        </Text>

        {/* Optional: tiny “AI on/off” indicator based on settings */}
        <View style={styles.focusMetaRow} testID="insights_focus_metaRow_01">
          <Ionicons
            name={settings.aiSuggestions ? "sparkles" : "sparkles-outline"}
            size={16}
            color={settings.aiSuggestions ? colors.accent : colors.subtext}
            testID="insights_focus_aiIcon_01"
          />
          <Text style={[styles.focusMetaTxt, { color: colors.subtext }]} testID="insights_focus_aiTxt_01">
            {settings.aiSuggestions ? "AI suggestions enabled" : "AI suggestions disabled"}
          </Text>
        </View>
      </View>

      <View style={{ height: 24 }} testID="insights_bottomSpacer_01" />
    </ScrollView>
  );
}

/* -------------------- Components -------------------- */

function TrendCard({
  colors,
  title,
  value,
  iconName,
  iconColor,
  cardIndex,
}: {
  colors: any;
  title: string;
  value: number;
  iconName: any;
  iconColor: string;
  cardIndex: number;
}) {
  return (
    <View
      style={[
        styles.trendCard,
        { borderColor: colors.border, backgroundColor: colors.card },
      ]}
      testID={`insights_trend_card_${cardIndex}_01`}
    >
      <View style={styles.trendTopRow} testID={`insights_trend_topRow_${cardIndex}_01`}>
        <Text
          style={[styles.trendTitle, { color: colors.subtext }]}
          testID={`insights_trend_titleTxt_${cardIndex}_01`}
        >
          {title}
        </Text>
        <Ionicons
          name={iconName}
          size={22}
          color={iconColor}
          testID={`insights_trend_icon_${cardIndex}_01`}
        />
      </View>

      <Text
        style={[
          styles.trendValue,
          { color: title === "Stress" ? "#C83737" : "#2F8F83" },
        ]}
        testID={`insights_trend_valueTxt_${cardIndex}_01`}
      >
        {value.toFixed(1)}
      </Text>
    </View>
  );
}

function Chip({ label, colors, index }: { label: string; colors: any; index: number }) {
  // Chips use accent color like screenshot
  return (
    <Pressable
      style={[styles.chip, { backgroundColor: colors.accent }]}
      testID={`insights_blocker_chip_${index}_01`}
    >
      <Text style={[styles.chipText, { color: colors.chipText }]} testID={`insights_blocker_chipTxt_${index}_01`}>
        {label}
      </Text>
    </Pressable>
  );
}

/* -------------------- Styles -------------------- */

const screenW = Dimensions.get("window").width;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  title: { fontSize: 40, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { marginTop: 8, fontSize: 18, fontWeight: "600" },

  sectionTitle: { marginTop: 26, marginBottom: 14, fontSize: 26, fontWeight: "900" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  trendCard: {
    width: (screenW - 20 * 2 - 12) / 2,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  trendTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  trendTitle: { fontSize: 18, fontWeight: "800" },
  trendValue: { marginTop: 16, fontSize: 40, fontWeight: "900" },

  streakCard: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
  },
  streakHeader: { flexDirection: "row", alignItems: "center" },
  streakTitle: { fontSize: 22, fontWeight: "900" },
  streakSub: { marginTop: 6, fontSize: 18, fontWeight: "700" },
  streakCount: { fontSize: 44, fontWeight: "900" },

  streakBars: { marginTop: 18, flexDirection: "row", gap: 12 },
  streakBar: { flex: 1, height: 10, borderRadius: 999 },

  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  chip: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 999,
  },
  chipText: { fontSize: 18, fontWeight: "900" },

  focusCard: {
    marginTop: 22,
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
  },
  focusTitle: { fontSize: 22, fontWeight: "900" },
  focusBody: { marginTop: 12, fontSize: 18, fontWeight: "700", lineHeight: 26 },

  focusMetaRow: { marginTop: 14, flexDirection: "row", alignItems: "center", gap: 8 },
  focusMetaTxt: { fontSize: 14, fontWeight: "700" },
});
