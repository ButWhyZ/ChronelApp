import React, { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  LayoutAnimation,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useAppTheme } from "../../hooks/use-app-theme";

/* ===============================
   Types
================================ */
type Task = {
  id: string;
  title: string;
  notes?: string;
  date: string;
  time?: string;
  priority: "low" | "medium" | "high";
  addToDeviceCalendar: boolean;
  createdAt: number;
};

type JournalEntry = {
  id: string;
  date: string;
  title: string;
  text: string;
  createdAt: number;
};

/* ===============================
   Storage Keys
================================ */
const STORAGE_KEYS = {
  tasks: "chronel_tasks",
  journals: "chronel_journal",
};

/* ===============================
   Helpers
================================ */
const TABBAR_SPACE = Platform.OS === "ios" ? 130 : 110;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function parseISODate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatLongDate(d: Date) {
  const weekdays = [
    "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",
  ];
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  return `${weekdays[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

/* ===============================
   Screen
================================ */
export default function DayScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ date?: string }>();

  const today = new Date();
  const isoDate =
    params.date ??
    `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [expandedJournalId, setExpandedJournalId] = useState<string | null>(null);

  /* ---------- Load Tasks ---------- */
  const loadTasks = useCallback(async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.tasks);
    const all: Task[] = raw ? JSON.parse(raw) : [];
    setTasks(all.filter(t => t.date === isoDate));
  }, [isoDate]);

  /* ---------- Load Journals ---------- */
  const loadJournals = useCallback(async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.journals);
    const all: JournalEntry[] = raw ? JSON.parse(raw) : [];
    setJournals(all.filter(j => j.date === isoDate));
  }, [isoDate]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
      loadJournals();
    }, [loadTasks, loadJournals])
  );

  const dateObj = useMemo(() => parseISODate(isoDate), [isoDate]);

  const toggleJournal = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedJournalId(prev => (prev === id ? null : id));
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: TABBAR_SPACE },
      ]}
      testID="day_scroll_01"
    >
      {/* Back */}
      <Pressable onPress={() => router.back()} style={styles.backRow}>
        <Ionicons name="arrow-back" size={22} color={colors.subtext} />
        <Text style={[styles.backTxt, { color: colors.subtext }]}>
          Back
        </Text>
      </Pressable>

      {/* Header */}
      <Text style={[styles.title, { color: colors.text }]}>
        {formatLongDate(dateObj)}
      </Text>
      <Text style={[styles.count, { color: colors.subtext }]}>
        {tasks.length} tasks
      </Text>

      {/* TASK LIST (UNCHANGED) */}
      {tasks.map((t, idx) => (
        <Pressable
          key={t.id}
          onPress={() =>
            router.push({
              pathname: "/calendar/edit-task",
              params: { id: t.id, date: isoDate },
            })
          }
          style={[
            styles.taskRow,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.taskTitle, { color: colors.text }]}>
              {t.title}
            </Text>
            <Text style={[styles.taskHint, { color: colors.subtext }]}>
              Tap to edit
            </Text>
          </View>

          <View
            style={[
              styles.badge,
              {
                borderColor:
                  t.priority === "low"
                    ? "#22C55E"
                    : t.priority === "medium"
                    ? "#F6B100"
                    : "#C83737",
              },
            ]}
          >
            <Text style={{ color: colors.text, fontWeight: "800" }}>
              {t.priority === "low"
                ? "Easy"
                : t.priority === "medium"
                ? "Medium"
                : "Hard"}
            </Text>
          </View>
        </Pressable>
      ))}

      {/* ===== JOURNAL SECTION (NEW) ===== */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Journal
        </Text>

        {journals.length === 0 ? (
          <Text style={{ marginTop: 8, color: colors.subtext }}>
            No journal entry for this day.
          </Text>
        ) : (
          journals.map(j => (
            <Pressable
              key={j.id}
              onPress={() => toggleJournal(j.id)}
              style={{ marginTop: 12 }}
            >
              <Text
                style={[
                  styles.journalTitle,
                  { color: colors.text },
                ]}
              >
                {j.title}
              </Text>

              {expandedJournalId === j.id && (
                <Text
                  style={[
                    styles.journalText,
                    { color: colors.text },
                  ]}
                >
                  {j.text}
                </Text>
              )}
            </Pressable>
          ))
        )}
      </View>

      {/* ADD TASK BUTTON (UNCHANGED) */}
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/calendar/add-task",
            params: { date: isoDate },
          })
        }
        style={[styles.addBtn, { backgroundColor: colors.tint }]}
      >
        <Ionicons name="add" size={26} color="#fff" />
        <Text style={styles.addBtnTxt}>Add Task</Text>
      </Pressable>

      <View style={{ height: 16 }} />
    </ScrollView>
  );
}

/* ===============================
   Styles
================================ */
const styles = StyleSheet.create({
  content: { padding: 20 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  backTxt: { fontSize: 18, fontWeight: "700" },

  title: { marginTop: 22, fontSize: 38, fontWeight: "900" },
  count: { marginTop: 8, fontSize: 18, fontWeight: "700" },

  taskRow: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  taskTitle: { fontSize: 20, fontWeight: "900" },
  taskHint: { marginTop: 4, fontSize: 14, fontWeight: "700" },

  badge: {
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  card: {
    marginTop: 24,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: "900" },

  journalTitle: { fontSize: 16, fontWeight: "900" },
  journalText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },

  addBtn: {
    marginTop: 28,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 22,
  },
  addBtnTxt: { color: "#fff", fontSize: 20, fontWeight: "900" },
});
