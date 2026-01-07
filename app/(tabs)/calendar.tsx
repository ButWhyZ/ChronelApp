import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useAppTheme } from "../../hooks/use-app-theme";

type Task = {
  id: string;
  title: string;
  notes?: string;
  date: string; // YYYY-MM-DD
  time?: string;
  priority: "low" | "medium" | "high"; // low=Easy, medium=Medium, high=Hard
  addToDeviceCalendar: boolean;
  createdAt: number;
};

const STORAGE_KEYS = { tasks: "chronel_tasks" };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

// ✅ Add extra padding because your glass tab bar is absolute-positioned
const TABBAR_SPACE = 120;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function getMonthGrid(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells: Array<{ date: Date | null; key: string }> = [];
  for (let i = 0; i < startDay; i++) {
    cells.push({ date: null, key: `blank-${year}-${monthIndex}-${i}` });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, monthIndex, day);
    cells.push({ date: d, key: toISODate(d) });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: null, key: `trail-${year}-${monthIndex}-${cells.length}` });
  }
  return cells;
}
function priorityRank(p: Task["priority"]) {
  if (p === "low") return 1;
  if (p === "medium") return 2;
  return 3;
}

export default function CalendarScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const loadTasks = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.tasks);
      setTasks(raw ? JSON.parse(raw) : []);
    } catch {
      setTasks([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const year = cursor.getFullYear();
  const monthIndex = cursor.getMonth();
  const grid = useMemo(() => getMonthGrid(year, monthIndex), [year, monthIndex]);

  const dayPriorityMap = useMemo(() => {
    const map = new Map<string, Task["priority"]>();
    for (const t of tasks) {
      const prev = map.get(t.date);
      if (!prev) map.set(t.date, t.priority);
      else map.set(t.date, priorityRank(t.priority) > priorityRank(prev) ? t.priority : prev);
    }
    return map;
  }, [tasks]);

  const dotColorForDay = useCallback(
    (iso: string) => {
      const p = dayPriorityMap.get(iso);
      if (!p) return null;
      if (p === "low") return "#22C55E";     // Easy green
      if (p === "medium") return "#F6B100";  // Medium yellow
      return "#C83737";                      // Hard red
    },
    [dayPriorityMap]
  );

  const goPrevMonth = () => setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNextMonth = () => setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  /**
   * ✅ BEST FIX (NOT RED):
   * This requires you have: app/calendar/[date].tsx
   */
  const openDay = (isoDate: string) => {
    router.push({
      pathname: "/calendar/day",
      params: { date: isoDate },
    });
  };

  const openAddTask = () => {
    const today = new Date();
    router.push({
      pathname: "/calendar/add-task",
      params: { date: toISODate(today) },
    });
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[styles.content, { paddingBottom: TABBAR_SPACE }]}
      testID="calendar_scrollView_01"
    >
      <Text style={[styles.title, { color: colors.text }]} testID="calendar_header_titleTxt_01">
        Calendar
      </Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]} testID="calendar_header_subtitleTxt_01">
        View tasks and check-ins
      </Text>

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

      <View style={styles.grid} testID="calendar_month_grid_01">
        {grid.map((cell, idx) => {
          if (!cell.date) {
            return <View key={cell.key} style={styles.dayCell} testID={`calendar_day_blank_${idx + 1}_01`} />;
          }

          const iso = toISODate(cell.date);
          const dayNum = cell.date.getDate();
          const dotColor = dotColorForDay(iso);

          const now = new Date();
          const isToday =
            now.getFullYear() === cell.date.getFullYear() &&
            now.getMonth() === cell.date.getMonth() &&
            now.getDate() === cell.date.getDate();

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
                  {
                    backgroundColor: colors.card,
                    borderColor: isToday ? colors.tint : "transparent",
                    borderWidth: isToday ? 2 : 0,
                  },
                ]}
                testID={`calendar_dayPill_${iso}_01`}
              >
                <Text style={[styles.dayText, { color: colors.text }]} testID={`calendar_dayTxt_${iso}_01`}>
                  {dayNum}
                </Text>

                {dotColor ? (
                  <View style={[styles.dot, { backgroundColor: dotColor }]} testID={`calendar_dayDot_${iso}_01`} />
                ) : (
                  <View style={styles.dotPlaceholder} testID={`calendar_dayDotEmpty_${iso}_01`} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={openAddTask}
        style={[styles.addBtn, { backgroundColor: colors.tint }]}
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
