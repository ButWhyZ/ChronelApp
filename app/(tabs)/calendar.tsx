import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type ThemeMode = "light" | "dark";

type Task = {
  id: string;
  title: string;
  notes?: string;
  date: string; // YYYY-MM-DD
  time?: string; // "12:30 PM"
  priority: "low" | "medium" | "high";
  addToDeviceCalendar: boolean;
  createdAt: number;
};

const STORAGE_KEYS = {
  theme: "chronel_theme",
  accent: "chronel_accent",
  tasks: "chronel_tasks",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function parseISODate(iso: string) {
  const [y, m, dd] = iso.split("-").map(Number);
  return new Date(y, m - 1, dd);
}

function getMonthGrid(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1);
  const startDay = first.getDay(); // 0..6
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells: Array<{ date: Date | null; key: string }> = [];

  // leading blanks
  for (let i = 0; i < startDay; i++) {
    cells.push({ date: null, key: `blank-${year}-${monthIndex}-${i}` });
  }
  // month days
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, monthIndex, day);
    cells.push({ date: d, key: toISODate(d) });
  }

  // trailing blanks to complete weeks (optional, keeps grid clean)
  while (cells.length % 7 !== 0) {
    cells.push({ date: null, key: `trail-${year}-${monthIndex}-${cells.length}` });
  }

  return cells;
}

export default function CalendarScreen() {
  const router = useRouter();

  const [theme, setTheme] = useState<ThemeMode>("light");
  const [accent, setAccent] = useState("#356AE6");
  const [tasks, setTasks] = useState<Task[]>([]);

  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // load appearance + tasks
  useEffect(() => {
    (async () => {
      try {
        const [t, a, savedTasks] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.theme),
          AsyncStorage.getItem(STORAGE_KEYS.accent),
          AsyncStorage.getItem(STORAGE_KEYS.tasks),
        ]);

        if (t === "light" || t === "dark") setTheme(t);
        if (a) setAccent(a);
        if (savedTasks) setTasks(JSON.parse(savedTasks));
      } catch {}
    })();

    // keep it updated (simple polling so changes show after modal save)
    const interval = setInterval(async () => {
      try {
        const [t, a, savedTasks] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.theme),
          AsyncStorage.getItem(STORAGE_KEYS.accent),
          AsyncStorage.getItem(STORAGE_KEYS.tasks),
        ]);
        if (t === "light" || t === "dark") setTheme(t);
        if (a) setAccent(a);
        if (savedTasks) setTasks(JSON.parse(savedTasks));
      } catch {}
    }, 900);

    return () => clearInterval(interval);
  }, []);

  const colors = useMemo(() => {
    const dark = theme === "dark";
    return {
      bg: dark ? "#0F1115" : "#FFFFFF",
      text: dark ? "#F5F7FA" : "#0B0D12",
      subtext: dark ? "#A7B0BF" : "#6B7280",
      border: dark ? "#232733" : "#E5E7EB",
      accent,
      dayText: dark ? "#F5F7FA" : "#0B0D12",
      mutedDay: dark ? "#7B8496" : "#9CA3AF",
    };
  }, [theme, accent]);

  const year = cursor.getFullYear();
  const monthIndex = cursor.getMonth();

  const grid = useMemo(() => getMonthGrid(year, monthIndex), [year, monthIndex]);

  const datesWithTasks = useMemo(() => {
    const set = new Set<string>();
    for (const task of tasks) set.add(task.date);
    return set;
  }, [tasks]);

  const goPrevMonth = () => setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNextMonth = () => setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const openDay = (isoDate: string) => {
    router.push({ pathname: "/calendar/day", params: { date: isoDate } });
  };

  const openAddTask = () => {
    // default to today in current month cursor (1st) or today's real date:
    const today = new Date();
    router.push({ pathname: "/calendar/add-task", params: { date: toISODate(today) } });
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.content}
      testID="calendar_scrollView_01"
    >
      <Text style={[styles.title, { color: colors.text }]} testID="calendar_header_titleTxt_01">
        Calendar
      </Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]} testID="calendar_header_subtitleTxt_01">
        View tasks and check-ins
      </Text>

      {/* Month Header */}
      <View style={styles.monthHeader} testID="calendar_month_headerRow_01">
        <Pressable onPress={goPrevMonth} style={styles.navBtn} testID="calendar_month_prevBtn_01">
          <Ionicons name="chevron-back" size={28} color={colors.text} testID="calendar_month_prevIcon_01" />
        </Pressable>

        <Text style={[styles.monthTitle, { color: colors.text }]} testID="calendar_month_titleTxt_01">
          {MONTHS[monthIndex]} {year}
        </Text>

        <Pressable onPress={goNextMonth} style={styles.navBtn} testID="calendar_month_nextBtn_01">
          <Ionicons name="chevron-forward" size={28} color={colors.text} testID="calendar_month_nextIcon_01" />
        </Pressable>
      </View>

      {/* Weekdays */}
      <View style={styles.weekRow} testID="calendar_weekdays_row_01">
        {WEEKDAYS.map((w, i) => (
          <Text
            key={w}
            style={[styles.weekday, { color: colors.subtext }]}
            testID={`calendar_weekdayTxt_${i + 1}_01`}
          >
            {w}
          </Text>
        ))}
      </View>

      {/* Grid */}
      <View style={styles.grid} testID="calendar_month_grid_01">
        {grid.map((cell, idx) => {
          if (!cell.date) {
            return <View key={cell.key} style={styles.dayCell} testID={`calendar_day_blank_${idx + 1}_01`} />;
          }

          const iso = toISODate(cell.date);
          const dayNum = cell.date.getDate();
          const hasDot = datesWithTasks.has(iso);

          const isToday = (() => {
            const now = new Date();
            return (
              now.getFullYear() === cell.date!.getFullYear() &&
              now.getMonth() === cell.date!.getMonth() &&
              now.getDate() === cell.date!.getDate()
            );
          })();

          return (
            <Pressable
              key={cell.key}
              style={styles.dayCell}
              onPress={() => openDay(iso)}
              testID={`calendar_dayCell_${iso}_01`}
            >
              <View
                style={[
                  styles.dayPill,
                  isToday ? { borderColor: colors.accent, borderWidth: 2 } : null,
                ]}
                testID={`calendar_dayPill_${iso}_01`}
              >
                <Text style={[styles.dayText, { color: colors.dayText }]} testID={`calendar_dayTxt_${iso}_01`}>
                  {dayNum}
                </Text>

                {hasDot ? (
                  <View
                    style={[styles.dot, { backgroundColor: colors.accent }]}
                    testID={`calendar_dayDot_${iso}_01`}
                  />
                ) : (
                  <View style={styles.dotPlaceholder} testID={`calendar_dayDotEmpty_${iso}_01`} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Add Task button */}
      <Pressable
        onPress={openAddTask}
        style={[styles.addBtn, { backgroundColor: colors.accent }]}
        testID="calendar_addTask_primaryBtn_01"
      >
        <Ionicons name="add" size={26} color="#fff" testID="calendar_addTask_plusIcon_01" />
        <Text style={styles.addBtnText} testID="calendar_addTask_btnTxt_01">
          Add Task
        </Text>
      </Pressable>

      <View style={{ height: 18 }} testID="calendar_bottomSpacer_01" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 42, fontWeight: "900" },
  subtitle: { marginTop: 8, fontSize: 18, fontWeight: "700" },

  monthHeader: { marginTop: 22, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  navBtn: { padding: 6 },
  monthTitle: { fontSize: 28, fontWeight: "900" },

  weekRow: { marginTop: 22, flexDirection: "row", justifyContent: "space-between" },
  weekday: { width: "14.285%", textAlign: "center", fontSize: 16, fontWeight: "800" },

  grid: { marginTop: 14, flexDirection: "row", flexWrap: "wrap" },
  dayCell: { width: "14.285%", paddingVertical: 10, alignItems: "center" },
  dayPill: { width: 54, height: 58, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  dayText: { fontSize: 18, fontWeight: "900" },

  dot: { width: 7, height: 7, borderRadius: 999, marginTop: 6 },
  dotPlaceholder: { width: 7, height: 7, marginTop: 6 },

  addBtn: {
    marginTop: 24,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 22,
  },
  addBtnText: { color: "#fff", fontSize: 20, fontWeight: "900" },
});
