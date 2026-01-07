import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useAppTheme } from "../../hooks/use-app-theme";

const TABBAR_SPACE = 120;

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
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${weekdays[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

export default function DayDetailRoute() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ date?: string }>();

  const today = new Date();
  const isoDate =
    params.date ??
    `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;

  const [tasks, setTasks] = useState<Task[]>([]);

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

  const dateObj = useMemo(() => parseISODate(isoDate), [isoDate]);

  const tasksForDay = useMemo(() => {
    return tasks
      .filter((t) => t.date === isoDate)
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [tasks, isoDate]);

  const openAdd = () => {
    router.push({ pathname: "/calendar/add-task", params: { date: isoDate } } as any);
  };

  const openEdit = (taskId: string) => {
    router.push({
      pathname: "/calendar/edit-task",
      params: { id: taskId, date: isoDate },
    } as any);
  };

  const priorityBadge = (p: Task["priority"]) => {
    if (p === "low") return { label: "Easy", bg: "transparent", border: colors.border, text: colors.subtext };
    if (p === "medium") return { label: "Medium", bg: "#FFF5D6", border: "#F6B100", text: "#F6B100" };
    return { label: "Hard", bg: "#FFE3E3", border: "#C83737", text: "#C83737" };
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[styles.content, { paddingBottom: TABBAR_SPACE }]}
      testID="day_scroll_01"
    >
      <Pressable onPress={() => router.back()} style={styles.backRow} testID="day_backBtn_01">
        <Ionicons name="arrow-back" size={22} color={colors.subtext} testID="day_backIcon_01" />
        <Text style={[styles.backTxt, { color: colors.subtext }]} testID="day_backTxt_01">
          Back
        </Text>
      </Pressable>

      <Text style={[styles.title, { color: colors.text }]} testID="day_title_01">
        {formatLongDate(dateObj)}
      </Text>

      <Text style={[styles.count, { color: colors.subtext }]} testID="day_count_01">
        {tasksForDay.length} tasks
      </Text>

      {tasksForDay.length === 0 ? (
        <View style={styles.emptyWrap} testID="day_emptyWrap_01">
          <Ionicons name="calendar-outline" size={72} color={colors.subtext} testID="day_emptyIcon_01" />
          <Text style={[styles.emptyTitle, { color: colors.text }]} testID="day_emptyTitle_01">
            No tasks yet
          </Text>
          <Text style={[styles.emptySub, { color: colors.subtext }]} testID="day_emptySub_01">
            Add your first task for this day
          </Text>

          <Pressable onPress={openAdd} style={[styles.primaryBtn, { backgroundColor: colors.tint }]} testID="day_addBtn_01">
            <Text style={styles.primaryBtnTxt} testID="day_addBtnTxt_01">
              Add Task
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.listWrap} testID="day_listWrap_01">
          {tasksForDay.map((t, idx) => {
            const badge = priorityBadge(t.priority);

            return (
              <Pressable
                key={t.id}
                onPress={() => openEdit(t.id)}
                style={[styles.taskRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                testID={`day_taskRow_${idx + 1}_01`}
              >
                <View style={{ flex: 1 }} testID={`day_taskLeft_${idx + 1}_01`}>
                  <Text style={[styles.taskTitle, { color: colors.text }]} testID={`day_taskTitle_${idx + 1}_01`}>
                    {t.title}
                  </Text>

                  {!!t.time && (
                    <Text style={[styles.meta, { color: colors.subtext }]} testID={`day_taskTime_${idx + 1}_01`}>
                      {t.time}
                    </Text>
                  )}

                  {!!t.notes && (
                    <Text style={[styles.meta, { color: colors.subtext }]} testID={`day_taskNotes_${idx + 1}_01`}>
                      {t.notes}
                    </Text>
                  )}

                  <Text style={[styles.editHint, { color: colors.subtext }]} testID={`day_taskEditHint_${idx + 1}_01`}>
                    Tap to edit
                  </Text>
                </View>

                <View
                  style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.border }]}
                  testID={`day_taskBadge_${idx + 1}_01`}
                >
                  <Text style={[styles.badgeTxt, { color: badge.text }]} testID={`day_taskBadgeTxt_${idx + 1}_01`}>
                    {badge.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      <Pressable onPress={openAdd} style={[styles.bottomBtn, { backgroundColor: colors.tint }]} testID="day_bottomAddBtn_01">
        <Ionicons name="add" size={26} color="#fff" testID="day_bottomAddIcon_01" />
        <Text style={styles.bottomBtnTxt} testID="day_bottomAddTxt_01">
          Add Task
        </Text>
      </Pressable>

      <View style={{ height: 18 }} testID="day_spacer_01" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  backTxt: { fontSize: 18, fontWeight: "700" },

  title: { marginTop: 22, fontSize: 38, fontWeight: "900" },
  count: { marginTop: 10, fontSize: 18, fontWeight: "700" },

  emptyWrap: { marginTop: 90, alignItems: "center" },
  emptyTitle: { marginTop: 16, fontSize: 26, fontWeight: "900" },
  emptySub: { marginTop: 10, fontSize: 18, fontWeight: "700", textAlign: "center" },

  primaryBtn: { marginTop: 24, paddingVertical: 16, paddingHorizontal: 26, borderRadius: 18 },
  primaryBtnTxt: { color: "#fff", fontSize: 20, fontWeight: "900" },

  listWrap: { marginTop: 18, gap: 12 },

  taskRow: { borderWidth: 1, borderRadius: 18, padding: 16, flexDirection: "row", gap: 12 },
  taskTitle: { fontSize: 20, fontWeight: "900" },
  meta: { marginTop: 6, fontSize: 15, fontWeight: "700" },
  editHint: { marginTop: 8, fontSize: 12, fontWeight: "800" },

  badge: { borderWidth: 2, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, alignSelf: "flex-start" },
  badgeTxt: { fontSize: 16, fontWeight: "900" },

  bottomBtn: { marginTop: 28, flexDirection: "row", gap: 10, alignItems: "center", justifyContent: "center", paddingVertical: 18, borderRadius: 22 },
  bottomBtnTxt: { color: "#fff", fontSize: 20, fontWeight: "900" },
});
