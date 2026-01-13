// app/(tabs)/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/use-app-theme";

type Goal = {
  id: string;
  title: string;
  notes?: string;
  date: string; // YYYY-MM-DD
  done: boolean;
  createdAt: number;
  completedAt?: number;
};

const STORAGE_KEYS = {
  goals: "chronel_daily_goals",
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function genId() {
  return `goal_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

// If your glass tab bar sits on top of content, this gives breathing room.
// Adjust if you change the tab bar height later.
const TAB_BAR_PAD = Platform.OS === "ios" ? 130 : 110;

export default function Dashboard() {
  const { colors } = useAppTheme();

  const todayIso = useMemo(() => toISODate(new Date()), []);

  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const load = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.goals);
      setAllGoals(raw ? JSON.parse(raw) : []);
    } catch {
      setAllGoals([]);
    }
  };

  const persist = async (next: Goal[]) => {
    setAllGoals(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(next));
    } catch {}
  };

  useEffect(() => {
    load();
  }, []);

  const todaysGoals = useMemo(
    () =>
      allGoals
        .filter((g) => g.date === todayIso)
        .sort((a, b) => a.createdAt - b.createdAt),
    [allGoals, todayIso]
  );

  const completedCount = todaysGoals.filter((g) => g.done).length;
  const totalCount = todaysGoals.length;
  const completionPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const addGoal = async () => {
    if (!title.trim()) {
      Alert.alert("Missing goal", "Add a goal title first.");
      return;
    }

    const g: Goal = {
      id: genId(),
      title: title.trim(),
      notes: notes.trim() ? notes.trim() : undefined,
      date: todayIso,
      done: false,
      createdAt: Date.now(),
    };

    await persist([...allGoals, g]);
    setTitle("");
    setNotes("");
  };

  const toggleDone = async (id: string) => {
    const next = allGoals.map((g) => {
      if (g.id !== id) return g;
      const nowDone = !g.done;
      return {
        ...g,
        done: nowDone,
        completedAt: nowDone ? Date.now() : undefined,
      };
    });
    await persist(next);
  };

  const removeGoal = async (id: string) => {
    const next = allGoals.filter((g) => g.id !== id);
    await persist(next);
  };

  const clearToday = async () => {
    Alert.alert("Clear today’s goals?", "This removes today’s goals only.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          const next = allGoals.filter((g) => g.date !== todayIso);
          await persist(next);
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.content}
      testID="dashboard_scroll_01"
    >
      {/* Header */}
      <View style={styles.headerRow} testID="dashboard_headerRow_01">
        <View style={{ flex: 1 }} testID="dashboard_headerLeft_01">
          <Text style={[styles.title, { color: colors.text }]} testID="dashboard_titleTxt_01">
            Dashboard
          </Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]} testID="dashboard_subTxt_01">
            Daily goals — inbox style
          </Text>
        </View>

        <Pressable onPress={clearToday} style={styles.headerBtn} testID="dashboard_clearBtn_01">
          <Ionicons name="trash-outline" size={20} color={colors.subtext} testID="dashboard_clearIcon_01" />
        </Pressable>
      </View>

      {/* Progress Card */}
      <View
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        testID="dashboard_progressCard_01"
      >
        <View style={styles.progressTop} testID="dashboard_progressTop_01">
          <Text style={[styles.cardTitle, { color: colors.text }]} testID="dashboard_progressTitle_01">
            Today
          </Text>
          <Text style={[styles.progressStat, { color: colors.tint }]} testID="dashboard_progressStat_01">
            {completedCount}/{totalCount} • {completionPct}%
          </Text>
        </View>

        <View
          style={[
            styles.progressTrack,
            { backgroundColor: colors.border },
          ]}
          testID="dashboard_progressTrack_01"
        >
          <View
            style={[
              styles.progressFill,
              { width: `${completionPct}%`, backgroundColor: colors.tint },
            ]}
            testID="dashboard_progressFill_01"
          />
        </View>

        <Text style={[styles.helper, { color: colors.subtext }]} testID="dashboard_progressHelper_01">
          Add goals below and check them off as you complete them.
        </Text>
      </View>

      {/* Add Goal */}
      <View
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        testID="dashboard_addCard_01"
      >
        <Text style={[styles.cardTitle, { color: colors.text }]} testID="dashboard_addTitle_01">
          Add a goal
        </Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Goal title (e.g., Gym, LeetCode, Study 1 hour)"
          placeholderTextColor={colors.subtext}
          style={[
            styles.input,
            { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border },
          ]}
          testID="dashboard_titleInput_01"
        />

        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional notes"
          placeholderTextColor={colors.subtext}
          style={[
            styles.textArea,
            { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border },
          ]}
          multiline
          testID="dashboard_notesInput_01"
        />

        <Pressable
          onPress={addGoal}
          style={[styles.primaryBtn, { backgroundColor: colors.tint }]}
          testID="dashboard_addBtn_01"
        >
          <Ionicons name="add" size={20} color="#fff" testID="dashboard_addIcon_01" />
          <Text style={styles.primaryBtnTxt} testID="dashboard_addBtnTxt_01">
            Add to Goals ✅
          </Text>
        </Pressable>
      </View>

      {/* Inbox */}
      <Text style={[styles.sectionTitle, { color: colors.text }]} testID="dashboard_inboxTitle_01">
        Goals
      </Text>

      {todaysGoals.length === 0 ? (
        <View style={styles.emptyWrap} testID="dashboard_emptyWrap_01">
          <Ionicons name="list-outline" size={60} color={colors.subtext} testID="dashboard_emptyIcon_01" />
          <Text style={[styles.emptyTitle, { color: colors.text }]} testID="dashboard_emptyTitle_01">
            No goals yet
          </Text>
          <Text style={[styles.emptySub, { color: colors.subtext }]} testID="dashboard_emptySub_01">
            Add a few goals for today. This becomes your daily inbox.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 12 }} testID="dashboard_inboxList_01">
          {todaysGoals.map((g, idx) => (
            <Pressable
              key={g.id}
              onPress={() => toggleDone(g.id)}
              style={[
                styles.goalRow,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              testID={`dashboard_goalRow_${idx + 1}_01`}
            >
              <View style={styles.goalLeft} testID={`dashboard_goalLeft_${idx + 1}_01`}>
                <View
                  style={[
                    styles.checkCircle,
                    {
                      borderColor: g.done ? colors.tint : colors.border,
                      backgroundColor: g.done ? colors.tint : "transparent",
                    },
                  ]}
                  testID={`dashboard_goalCheck_${idx + 1}_01`}
                >
                  {g.done ? (
                    <Ionicons name="checkmark" size={16} color="#fff" testID={`dashboard_goalCheckIcon_${idx + 1}_01`} />
                  ) : null}
                </View>

                <View style={{ flex: 1 }} testID={`dashboard_goalTextWrap_${idx + 1}_01`}>
                  <Text
                    style={[
                      styles.goalTitle,
                      { color: colors.text, textDecorationLine: g.done ? "line-through" : "none" },
                    ]}
                    testID={`dashboard_goalTitle_${idx + 1}_01`}
                  >
                    {g.title}
                  </Text>
                  {!!g.notes && (
                    <Text
                      style={[styles.goalNotes, { color: colors.subtext }]}
                      numberOfLines={2}
                      testID={`dashboard_goalNotes_${idx + 1}_01`}
                    >
                      {g.notes}
                    </Text>
                  )}
                </View>
              </View>

              <Pressable
                onPress={() => removeGoal(g.id)}
                hitSlop={10}
                testID={`dashboard_goalDeleteBtn_${idx + 1}_01`}
              >
                <Ionicons name="close" size={20} color={colors.subtext} testID={`dashboard_goalDeleteIcon_${idx + 1}_01`} />
              </Pressable>
            </Pressable>
          ))}
        </View>
      )}

      {/* End of Day */}
      <View
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        testID="dashboard_eodCard_01"
      >
        <Text style={[styles.cardTitle, { color: colors.text }]} testID="dashboard_eodTitle_01">
          End of Day Check-In
        </Text>

        <Text style={[styles.helper, { color: colors.subtext }]} testID="dashboard_eodBody_01">
          Tonight, your check-in will reflect how many goals you completed. This gives you a simple,
          honest view of your day without guessing.
        </Text>

        <View style={styles.eodRow} testID="dashboard_eodRow_01">
          <Ionicons name="sparkles-outline" size={18} color={colors.tint} testID="dashboard_eodIcon_01" />
          <Text style={[styles.eodTxt, { color: colors.text }]} testID="dashboard_eodTxt_01">
            You completed{" "}
            <Text style={{ color: colors.tint, fontWeight: "900" }}>{completedCount}</Text> out of{" "}
            <Text style={{ color: colors.tint, fontWeight: "900" }}>{totalCount}</Text> goals today.
          </Text>
        </View>

        <Pressable
          onPress={() => Alert.alert("Coming soon", "We’ll connect this to your nightly check-in flow.")}
          style={[styles.secondaryBtn, { borderColor: colors.border }]}
          testID="dashboard_eodBtn_01"
        >
          <Text style={[styles.secondaryBtnTxt, { color: colors.text }]} testID="dashboard_eodBtnTxt_01">
            Start nightly check-in (soon)
          </Text>
        </Pressable>
      </View>

      {/* Spacer so tab bar never covers content */}
      <View style={{ height: TAB_BAR_PAD }} testID="dashboard_bottomPad_01" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 24 },

  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  headerBtn: { padding: 10 },

  title: { fontSize: 34, fontWeight: "900" },
  subtitle: { marginTop: 6, fontSize: 16, fontWeight: "700" },

  sectionTitle: { marginTop: 22, marginBottom: 12, fontSize: 22, fontWeight: "900" },

  card: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },

  cardTitle: { fontSize: 18, fontWeight: "900" },
  helper: { marginTop: 10, fontSize: 14, fontWeight: "700", lineHeight: 20 },

  progressTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  progressStat: { fontSize: 14, fontWeight: "900" },

  progressTrack: { marginTop: 12, height: 10, borderRadius: 999, overflow: "hidden" },
  progressFill: { height: 10, borderRadius: 999 },

  input: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: "700",
  },
  textArea: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: "700",
    minHeight: 90,
  },

  primaryBtn: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryBtnTxt: { color: "#fff", fontSize: 16, fontWeight: "900" },

  goalRow: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  goalLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },

  checkCircle: { width: 26, height: 26, borderRadius: 999, borderWidth: 2, alignItems: "center", justifyContent: "center" },

  goalTitle: { fontSize: 16, fontWeight: "900" },
  goalNotes: { marginTop: 6, fontSize: 13, fontWeight: "700", lineHeight: 18 },

  emptyWrap: { marginTop: 30, alignItems: "center", padding: 16 },
  emptyTitle: { marginTop: 10, fontSize: 18, fontWeight: "900" },
  emptySub: { marginTop: 8, fontSize: 14, fontWeight: "700", textAlign: "center", lineHeight: 20 },

  eodRow: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  eodTxt: { flex: 1, fontSize: 14, fontWeight: "700", lineHeight: 20 },

  secondaryBtn: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnTxt: { fontSize: 14, fontWeight: "900" },
});
