import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppTheme } from "../../hooks/use-app-theme";

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

export default function EditTaskScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  const params = useLocalSearchParams<{ id?: string; date?: string }>();
  const taskId = params.id ?? "";
  const fallbackDate = params.date ?? new Date().toISOString().slice(0, 10);

  const inputBg = colors.inputBg ?? colors.card ?? "transparent";

  const [loading, setLoading] = useState(true);
  const [original, setOriginal] = useState<Task | null>(null);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(fallbackDate);
  const [time, setTime] = useState("12:30 PM");
  const [priority, setPriority] = useState<Task["priority"]>("low");
  const [addToDeviceCalendar, setAddToDeviceCalendar] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.tasks);
        const all: Task[] = raw ? JSON.parse(raw) : [];
        const found = all.find((t) => t.id === taskId) ?? null;

        setOriginal(found);

        if (found) {
          setTitle(found.title ?? "");
          setNotes(found.notes ?? "");
          setDate(found.date ?? fallbackDate);
          setTime(found.time ?? "12:30 PM");
          setPriority(found.priority ?? "low");
          setAddToDeviceCalendar(!!found.addToDeviceCalendar);
        }
      } catch {
        setOriginal(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [taskId, fallbackDate]);

  const PriorityBtn = ({
    label,
    value,
    index,
  }: {
    label: string;
    value: Task["priority"];
    index: number;
  }) => {
    const selected = priority === value;

    const styleMap = {
      low: { border: "#22C55E", text: "#22C55E", bg: "rgba(34,197,94,0.14)" },
      medium: { border: "#F6B100", text: "#F6B100", bg: "#FFF5D6" },
      high: { border: "#C83737", text: "#C83737", bg: "#FFE3E3" },
    }[value];

    return (
      <Pressable
        onPress={() => setPriority(value)}
        style={[
          styles.priorityBtn,
          {
            borderColor: selected ? styleMap.border : colors.border,
            backgroundColor: selected ? styleMap.bg : "transparent",
          },
        ]}
        testID={`editTask_priorityBtn_${index}_01`}
      >
        <Text
          style={[styles.priorityTxt, { color: selected ? styleMap.text : colors.text }]}
          testID={`editTask_priorityTxt_${index}_01`}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  const goBackToDay = (iso: string) => {
    // return to the day view (dynamic route)
    router.replace({ pathname: "/calendar/[date]", params: { date: iso } } as any);
  };

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please add a task title.");
      return;
    }

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.tasks);
      const all: Task[] = raw ? JSON.parse(raw) : [];

      const updated: Task = {
        id: taskId,
        title: title.trim(),
        notes: notes.trim() ? notes.trim() : undefined,
        date,
        time,
        priority,
        addToDeviceCalendar,
        createdAt: original?.createdAt ?? Date.now(),
      };

      const next = all.map((t) => (t.id === taskId ? updated : t));
      await AsyncStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(next));

      goBackToDay(updated.date);
    } catch {
      Alert.alert("Error", "Could not save your changes. Try again.");
    }
  };

  const onDelete = async () => {
    Alert.alert("Delete task?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const raw = await AsyncStorage.getItem(STORAGE_KEYS.tasks);
            const all: Task[] = raw ? JSON.parse(raw) : [];
            const next = all.filter((t) => t.id !== taskId);
            await AsyncStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(next));

            goBackToDay(date);
          } catch {
            Alert.alert("Error", "Could not delete the task. Try again.");
          }
        },
      },
    ]);
  };

  const headerTitle = useMemo(() => (loading ? "Loading..." : "Edit Task"), [loading]);

  if (!taskId) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, padding: 20, justifyContent: "center" }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}>
          Missing task id.
        </Text>
      </View>
    );
  }

  if (!loading && !original) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, padding: 20, justifyContent: "center" }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}>
          Task not found (it may have been deleted).
        </Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.tint, fontWeight: "900" }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.content} testID="editTask_scroll_01">
      <View style={styles.headerRow} testID="editTask_headerRow_01">
        <Text style={[styles.headerTitle, { color: colors.text }]} testID="editTask_headerTitleTxt_01">
          {headerTitle}
        </Text>
        <Pressable onPress={() => router.back()} testID="editTask_closeBtn_01">
          <Ionicons name="close" size={28} color={colors.text} testID="editTask_closeIcon_01" />
        </Pressable>
      </View>

      <Text style={[styles.label, { color: colors.text }]} testID="editTask_titleLabel_01">
        Title <Text style={{ color: "#C83737" }}>*</Text>
      </Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Task title..."
        placeholderTextColor={colors.subtext}
        style={[styles.input, { backgroundColor: inputBg, color: colors.text }]}
        testID="editTask_titleInput_01"
      />

      <Text style={[styles.label, { color: colors.text }]} testID="editTask_notesLabel_01">
        Notes (optional)
      </Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Additional details..."
        placeholderTextColor={colors.subtext}
        style={[styles.textArea, { backgroundColor: inputBg, color: colors.text }]}
        multiline
        testID="editTask_notesInput_01"
      />

      <View style={styles.row} testID="editTask_dateTimeRow_01">
        <View style={{ flex: 1 }} testID="editTask_dateCol_01">
          <Text style={[styles.label, { color: colors.text }]} testID="editTask_dateLabel_01">
            Date <Text style={{ color: "#C83737" }}>*</Text>
          </Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            style={[styles.input, { backgroundColor: inputBg, color: colors.text }]}
            testID="editTask_dateInput_01"
          />
        </View>

        <View style={{ flex: 1 }} testID="editTask_timeCol_01">
          <Text style={[styles.label, { color: colors.text }]} testID="editTask_timeLabel_01">
            Time
          </Text>
          <TextInput
            value={time}
            onChangeText={setTime}
            style={[styles.input, { backgroundColor: inputBg, color: colors.text }]}
            testID="editTask_timeInput_01"
          />
        </View>
      </View>

      <Text style={[styles.label, { color: colors.text }]} testID="editTask_priorityLabel_01">
        Difficulty
      </Text>
      <View style={styles.priorityRow} testID="editTask_priorityRow_01">
        <PriorityBtn label="Easy" value="low" index={1} />
        <PriorityBtn label="Medium" value="medium" index={2} />
        <PriorityBtn label="Hard" value="high" index={3} />
      </View>

      <View
        style={[styles.toggleCard, { borderColor: colors.border, backgroundColor: colors.card }]}
        testID="editTask_deviceCalendarCard_01"
      >
        <View style={{ flex: 1 }} testID="editTask_deviceCalendarLeft_01">
          <Text style={[styles.toggleTitle, { color: colors.text }]} testID="editTask_deviceCalendarTitle_01">
            Add to device calendar
          </Text>
          <Text style={[styles.toggleSub, { color: colors.subtext }]} testID="editTask_deviceCalendarSub_01">
            Sync this task with your calendar app
          </Text>
        </View>

        <Switch
          value={addToDeviceCalendar}
          onValueChange={setAddToDeviceCalendar}
          trackColor={{ false: "#E5E7EB", true: colors.tint }}
          testID="editTask_deviceCalendarSwitch_01"
        />
      </View>

      <View style={styles.footerRow} testID="editTask_footerRow_01">
        <Pressable
          onPress={onDelete}
          style={[styles.deleteBtn, { borderColor: "#C83737" }]}
          testID="editTask_deleteBtn_01"
        >
          <Text style={[styles.deleteTxt, { color: "#C83737" }]} testID="editTask_deleteTxt_01">
            Delete
          </Text>
        </Pressable>

        <Pressable
          onPress={onSave}
          style={[styles.saveBtn, { backgroundColor: colors.tint }]}
          testID="editTask_saveBtn_01"
        >
          <Text style={styles.saveTxt} testID="editTask_saveTxt_01">
            Save Changes
          </Text>
        </Pressable>
      </View>

      <View style={{ height: 22 }} testID="editTask_bottomSpacer_01" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },

  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 34, fontWeight: "900" },

  label: { marginTop: 22, marginBottom: 10, fontSize: 20, fontWeight: "900" },

  input: { borderRadius: 18, paddingHorizontal: 18, paddingVertical: 16, fontSize: 18, fontWeight: "800" },
  textArea: { borderRadius: 18, paddingHorizontal: 18, paddingVertical: 16, fontSize: 16, fontWeight: "700", minHeight: 140 },

  row: { flexDirection: "row", gap: 14, marginTop: 6 },

  priorityRow: { flexDirection: "row", gap: 14, marginTop: 6 },
  priorityBtn: { flex: 1, borderWidth: 3, borderRadius: 999, paddingVertical: 16, alignItems: "center" },
  priorityTxt: { fontSize: 18, fontWeight: "900" },

  toggleCard: { marginTop: 22, borderWidth: 1, borderRadius: 18, padding: 18, flexDirection: "row", alignItems: "center", gap: 12 },
  toggleTitle: { fontSize: 18, fontWeight: "900" },
  toggleSub: { marginTop: 8, fontSize: 14, fontWeight: "700" },

  footerRow: { flexDirection: "row", gap: 14, marginTop: 26 },

  deleteBtn: { flex: 1, borderWidth: 2, borderRadius: 18, paddingVertical: 16, alignItems: "center" },
  deleteTxt: { fontSize: 18, fontWeight: "900" },

  saveBtn: { flex: 2, borderRadius: 18, paddingVertical: 16, alignItems: "center" },
  saveTxt: { color: "#fff", fontSize: 18, fontWeight: "900" },
});
