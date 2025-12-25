import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

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

const STORAGE_KEYS = { tasks: "chronel_tasks" };

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function parseISODate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function formatLongDate(d: Date) {
  const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  return `${weekdays[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

export default function DayDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const today = new Date();
  const isoDate =
    params.date ??
    `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;

  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const colors = useMemo(() => {
    const dark = colorScheme === "dark";
    return {
      bg: theme.background,
      text: theme.text,
      subtext: dark ? "#A7B0BF" : "#6B7280",
      border: dark ? "#232733" : "#E5E7EB",
      accent: theme.tint,
      card: dark ? "#151823" : "#FFFFFF",
    };
  }, [colorScheme, theme.background, theme.text, theme.tint]);

  const [tasks, setTasks] = useState<Task[]>([]);

  const loadTasks = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.tasks);
      setTasks(raw ? JSON.parse(raw) : []);
    } catch {
      setTasks([]);
    }
  }, []);

  // ✅ refresh whenever you navigate back to this screen
  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const dateObj = useMemo(() => parseISODate(isoDate), [isoDate]);

  const tasksForDay = useMemo(() => {
    return tasks
      .filter((t) => t.date === isoDate)
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [tasks, isoDate]);

  const openAdd = () => {
    router.push({ pathname: "/calendar/add-task", params: { date: isoDate } });
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.content}
      testID="dayDetail_scrollView_01"
    >
      <Pressable onPress={() => router.back()} style={styles.backRow} testID="dayDetail_back_btn_01">
        <Ionicons name="arrow-back" size={22} color={colors.subtext} testID="dayDetail_back_icon_01" />
        <Text style={[styles.backTxt, { color: colors.subtext }]} testID="dayDetail_back_txt_01">
          Back
        </Text>
      </Pressable>

      <Text style={[styles.dateTitle, { color: colors.text }]} testID="dayDetail_titleTxt_01">
        {formatLongDate(dateObj)}
      </Text>

      <Text style={[styles.countTxt, { color: colors.subtext }]} testID="dayDetail_countTxt_01">
        {tasksForDay.length} tasks
      </Text>

      {tasksForDay.length === 0 ? (
        <View style={styles.emptyWrap} testID="dayDetail_empty_wrap_01">
          <Ionicons name="calendar-outline" size={72} color={colors.subtext} testID="dayDetail_empty_icon_01" />
          <Text style={[styles.emptyTitle, { color: colors.text }]} testID="dayDetail_empty_titleTxt_01">
            No tasks yet
          </Text>
          <Text style={[styles.emptySub, { color: colors.subtext }]} testID="dayDetail_empty_subtitleTxt_01">
            Add your first task for this day
          </Text>

          <Pressable
            onPress={openAdd}
            style={[styles.midAddBtn, { backgroundColor: colors.accent }]}
            testID="dayDetail_empty_addBtn_01"
          >
            <Text style={styles.midAddBtnTxt} testID="dayDetail_empty_addBtnTxt_01">
              Add Task
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.listWrap} testID="dayDetail_list_wrap_01">
          {tasksForDay.map((task, idx) => (
            <View
              key={task.id}
              style={[styles.taskRow, { borderColor: colors.border, backgroundColor: colors.card }]}
              testID={`dayDetail_taskRow_${idx + 1}_01`}
            >
              <View style={{ flex: 1 }} testID={`dayDetail_taskRow_left_${idx + 1}_01`}>
                <Text style={[styles.taskTitle, { color: colors.text }]} testID={`dayDetail_taskTitleTxt_${idx + 1}_01`}>
                  {task.title}
                </Text>
                {!!task.time && (
                  <Text style={[styles.taskMeta, { color: colors.subtext }]} testID={`dayDetail_taskTimeTxt_${idx + 1}_01`}>
                    {task.time}
                  </Text>
                )}
                {!!task.notes && (
                  <Text style={[styles.taskMeta, { color: colors.subtext }]} testID={`dayDetail_taskNotesTxt_${idx + 1}_01`}>
                    {task.notes}
                  </Text>
                )}
              </View>

              <PriorityPill priority={task.priority} colors={colors} index={idx + 1} />
            </View>
          ))}
        </View>
      )}

      <Pressable
        onPress={openAdd}
        style={[styles.bottomAddBtn, { backgroundColor: colors.accent }]}
        testID="dayDetail_bottom_addBtn_01"
      >
        <Ionicons name="add" size={26} color="#fff" testID="dayDetail_bottom_addIcon_01" />
        <Text style={styles.bottomAddBtnTxt} testID="dayDetail_bottom_addTxt_01">
          Add Task
        </Text>
      </Pressable>

      <View style={{ height: 18 }} testID="dayDetail_bottomSpacer_01" />
    </ScrollView>
  );
}

function PriorityPill({
  priority,
  colors,
  index,
}: {
  priority: "low" | "medium" | "high";
  colors: any;
  index: number;
}) {
  const map = {
    low: { label: "Low", border: colors.border, text: colors.subtext, bg: "transparent" },
    medium: { label: "Medium", border: "#F6B100", text: "#F6B100", bg: "#FFF5D6" },
    high: { label: "High", border: "#C83737", text: "#C83737", bg: "#FFE3E3" },
  }[priority];

  return (
    <View
      style={[styles.priority, { borderColor: map.border, backgroundColor: map.bg }]}
      testID={`dayDetail_priorityPill_${index}_01`}
    >
      <Text style={[styles.priorityTxt, { color: map.text }]} testID={`dayDetail_priorityTxt_${index}_01`}>
        {map.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  backTxt: { fontSize: 18, fontWeight: "700" },

  dateTitle: { marginTop: 22, fontSize: 40, fontWeight: "900" },
  countTxt: { marginTop: 10, fontSize: 20, fontWeight: "700" },

  emptyWrap: { marginTop: 90, alignItems: "center" },
  emptyTitle: { marginTop: 16, fontSize: 26, fontWeight: "900" },
  emptySub: { marginTop: 10, fontSize: 18, fontWeight: "700", textAlign: "center" },

  midAddBtn: { marginTop: 24, paddingVertical: 16, paddingHorizontal: 26, borderRadius: 18 },
  midAddBtnTxt: { color: "#fff", fontSize: 20, fontWeight: "900" },

  listWrap: { marginTop: 18, gap: 12 },
  taskRow: { borderWidth: 1, borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "flex-start", gap: 12 },
  taskTitle: { fontSize: 20, fontWeight: "900" },
  taskMeta: { marginTop: 6, fontSize: 15, fontWeight: "700" },

  priority: { borderWidth: 2, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  priorityTxt: { fontSize: 16, fontWeight: "900" },

  bottomAddBtn: {
    marginTop: 28,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 22,
  },
  bottomAddBtnTxt: { color: "#fff", fontSize: 20, fontWeight: "900" },
});
