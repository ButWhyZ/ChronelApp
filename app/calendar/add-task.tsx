import React, { useMemo, useState } from "react";
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

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type Task = {
  id: string;
  title: string;
  notes?: string;
  date: string; // YYYY-MM-DD
  time?: string;
  priority: "low" | "medium" | "high";
  addToDeviceCalendar: boolean;
  createdAt: number;
};

const STORAGE_KEYS = {
  tasks: "chronel_tasks",
};

function genId() {
  return `task_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export default function AddTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const initialDate = params.date ?? new Date().toISOString().slice(0, 10);

  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const colors = useMemo(() => {
    const dark = colorScheme === "dark";
    return {
      bg: theme.background,
      text: theme.text,
      subtext: dark ? "#A7B0BF" : "#6B7280",
      border: dark ? "#232733" : "#E5E7EB",
      inputBg: dark ? "#151823" : "#EEF0F4",
      accent: theme.tint,
      card: dark ? "#151823" : "#F7F8FB",
      danger: "#C83737",
    };
  }, [colorScheme, theme.background, theme.text, theme.tint]);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState("12:30 PM");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [addToDeviceCalendar, setAddToDeviceCalendar] = useState(false);

  const saveTask = async () => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please add a task title.");
      return;
    }

    const task: Task = {
      id: genId(),
      title: title.trim(),
      notes: notes.trim() ? notes.trim() : undefined,
      date,
      time,
      priority,
      addToDeviceCalendar,
      createdAt: Date.now(),
    };

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.tasks);
      const existing: Task[] = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem(
        STORAGE_KEYS.tasks,
        JSON.stringify([...existing, task])
      );
    } catch {}

    router.back();
  };

  const PriorityBtn = ({
    label,
    value,
    index,
  }: {
    label: string;
    value: "low" | "medium" | "high";
    index: number;
  }) => {
    const selected = priority === value;

    const styleMap = {
      low: { border: colors.border, text: colors.text, bg: "transparent" },
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
        testID={`taskModal_priorityBtn_${index}_01`}
      >
        <Text
          style={[
            styles.priorityTxt,
            { color: selected ? styleMap.text : colors.text },
          ]}
          testID={`taskModal_priorityTxt_${index}_01`}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.content}
      testID="taskModal_scrollView_01"
    >
      {/* Header */}
      <View style={styles.headerRow} testID="taskModal_headerRow_01">
        <Text
          style={[styles.headerTitle, { color: colors.text }]}
          testID="taskModal_headerTitleTxt_01"
        >
          Add Task
        </Text>
        <Pressable onPress={() => router.back()} testID="taskModal_closeBtn_01">
          <Ionicons
            name="close"
            size={28}
            color={colors.text}
            testID="taskModal_closeIcon_01"
          />
        </Pressable>
      </View>

      {/* Title */}
      <Text style={[styles.label, { color: colors.text }]} testID="taskModal_titleLabelTxt_01">
        Title{" "}
        <Text style={{ color: colors.danger }} testID="taskModal_titleRequiredMarkTxt_01">
          *
        </Text>
      </Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Task title..."
        placeholderTextColor={colors.subtext}
        style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
        testID="taskModal_titleInput_01"
      />

      {/* Notes */}
      <Text style={[styles.label, { color: colors.text }]} testID="taskModal_notesLabelTxt_01">
        Notes (optional)
      </Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Additional details..."
        placeholderTextColor={colors.subtext}
        style={[styles.textArea, { backgroundColor: colors.inputBg, color: colors.text }]}
        multiline
        testID="taskModal_notesInput_01"
      />

      {/* Date/Time */}
      <View style={styles.row} testID="taskModal_dateTimeRow_01">
        <View style={{ flex: 1 }} testID="taskModal_dateCol_01">
          <Text style={[styles.label, { color: colors.text }]} testID="taskModal_dateLabelTxt_01">
            Date{" "}
            <Text style={{ color: colors.danger }} testID="taskModal_dateRequiredMarkTxt_01">
              *
            </Text>
          </Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
            testID="taskModal_dateInput_01"
          />
        </View>

        <View style={{ flex: 1 }} testID="taskModal_timeCol_01">
          <Text style={[styles.label, { color: colors.text }]} testID="taskModal_timeLabelTxt_01">
            Time
          </Text>
          <TextInput
            value={time}
            onChangeText={setTime}
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
            testID="taskModal_timeInput_01"
          />
        </View>
      </View>

      {/* Priority */}
      <Text style={[styles.label, { color: colors.text }]} testID="taskModal_priorityLabelTxt_01">
        Priority
      </Text>
      <View style={styles.priorityRow} testID="taskModal_priorityRow_01">
        <PriorityBtn label="Low" value="low" index={1} />
        <PriorityBtn label="Medium" value="medium" index={2} />
        <PriorityBtn label="High" value="high" index={3} />
      </View>

      {/* Add to device calendar */}
      <View
        style={[
          styles.toggleCard,
          { borderColor: colors.border, backgroundColor: colors.card },
        ]}
        testID="taskModal_deviceCalendarCard_01"
      >
        <View style={{ flex: 1 }} testID="taskModal_deviceCalendarLeft_01">
          <Text style={[styles.toggleTitle, { color: colors.text }]} testID="taskModal_deviceCalendarTitleTxt_01">
            Add to device calendar
          </Text>
          <Text style={[styles.toggleSub, { color: colors.subtext }]} testID="taskModal_deviceCalendarSubTxt_01">
            Sync this task with your calendar app
          </Text>
        </View>

        <Switch
          value={addToDeviceCalendar}
          onValueChange={setAddToDeviceCalendar}
          trackColor={{ false: "#E5E7EB", true: colors.accent }}
          testID="taskModal_deviceCalendarSwitch_01"
        />
      </View>

      {/* Footer */}
      <View style={styles.footerRow} testID="taskModal_footerRow_01">
        <Pressable
          onPress={() => router.back()}
          style={[styles.cancelBtn, { borderColor: colors.border }]}
          testID="taskModal_cancelBtn_01"
        >
          <Text style={[styles.cancelTxt, { color: colors.text }]} testID="taskModal_cancelTxt_01">
            Cancel
          </Text>
        </Pressable>

        <Pressable
          onPress={saveTask}
          style={[styles.saveBtn, { backgroundColor: colors.accent }]}
          testID="taskModal_saveBtn_01"
        >
          <Text style={styles.saveTxt} testID="taskModal_saveTxt_01">
            Save Task
          </Text>
        </Pressable>
      </View>

      <View style={{ height: 22 }} testID="taskModal_bottomSpacer_01" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },

  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 34, fontWeight: "900" },

  label: { marginTop: 22, marginBottom: 10, fontSize: 22, fontWeight: "900" },

  input: { borderRadius: 18, paddingHorizontal: 18, paddingVertical: 16, fontSize: 20, fontWeight: "800" },
  textArea: { borderRadius: 18, paddingHorizontal: 18, paddingVertical: 16, fontSize: 18, fontWeight: "700", minHeight: 140 },

  row: { flexDirection: "row", gap: 14, marginTop: 6 },

  priorityRow: { flexDirection: "row", gap: 14, marginTop: 6 },
  priorityBtn: { flex: 1, borderWidth: 3, borderRadius: 999, paddingVertical: 16, alignItems: "center" },
  priorityTxt: { fontSize: 20, fontWeight: "900" },

  toggleCard: { marginTop: 22, borderWidth: 1, borderRadius: 18, padding: 18, flexDirection: "row", alignItems: "center", gap: 12 },
  toggleTitle: { fontSize: 20, fontWeight: "900" },
  toggleSub: { marginTop: 8, fontSize: 16, fontWeight: "700" },

  footerRow: { flexDirection: "row", gap: 14, marginTop: 26 },
  cancelBtn: { flex: 1, borderWidth: 2, borderRadius: 18, paddingVertical: 16, alignItems: "center" },
  cancelTxt: { fontSize: 20, fontWeight: "900" },

  saveBtn: { flex: 2, borderRadius: 18, paddingVertical: 16, alignItems: "center" },
  saveTxt: { color: "#fff", fontSize: 20, fontWeight: "900" },
});
