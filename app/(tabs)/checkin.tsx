// app/(tabs)/checkin.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppTheme } from "@/hooks/use-app-theme";

type JournalEntry = {
  id: string;
  date: string;
  title: string;
  text: string;
  createdAt: number;
};

const JOURNAL_KEY = "chronel_journal";
const TAB_BAR_PAD = Platform.OS === "ios" ? 130 : 110;

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function genId() {
  return `journal_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export default function CheckIn() {
  const { colors } = useAppTheme();
  const todayIso = useMemo(() => toISODate(new Date()), []);

  const [journalTitle, setJournalTitle] = useState("");
  const [journalText, setJournalText] = useState("");

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  /* ---------- Save Journal ---------- */
  const saveJournal = async () => {
    if (!journalTitle.trim() || !journalText.trim()) {
      Alert.alert("Missing info", "Please add a title and journal entry.");
      return;
    }

    const entry: JournalEntry = {
      id: genId(),
      date: todayIso,
      title: journalTitle.trim(),
      text: journalText.trim(),
      createdAt: Date.now(),
    };

    try {
      const raw = await AsyncStorage.getItem(JOURNAL_KEY);
      const existing: JournalEntry[] = raw ? JSON.parse(raw) : [];

      await AsyncStorage.setItem(
        JOURNAL_KEY,
        JSON.stringify([...existing, entry])
      );

      setJournalTitle("");
      setJournalText("");

      Alert.alert("Saved", "Journal saved to today’s calendar.");
    } catch {
      Alert.alert("Error", "Could not save journal.");
    }
  };

  /* ---------- AI (placeholder) ---------- */
  const generateAi = () => {
    if (!aiPrompt.trim()) {
      Alert.alert("AI input required", "Write something for the AI.");
      return;
    }

    setLoadingAi(true);
    setTimeout(() => {
      setAiResponse(
        "Try focusing on one small, achievable win tomorrow. Momentum builds consistency."
      );
      setLoadingAi(false);
    }, 1200);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[styles.root, { paddingBottom: TAB_BAR_PAD }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Daily Check-In
      </Text>

      {/* JOURNAL */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Journal
      </Text>

      <TextInput
        value={journalTitle}
        onChangeText={setJournalTitle}
        placeholder="Journal title"
        placeholderTextColor={colors.subtext}
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
      />

      <TextInput
        value={journalText}
        onChangeText={setJournalText}
        multiline
        textAlignVertical="top"
        placeholder="Write about your day (this is private and not sent to AI)"
        placeholderTextColor={colors.subtext}
        style={[
          styles.textarea,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
      />

      <Pressable
        onPress={saveJournal}
        style={[styles.primaryBtn, { backgroundColor: colors.tint }]}
      >
        <Text style={styles.primaryBtnTxt}>Save Journal</Text>
      </Pressable>

      {/* AI */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        AI Suggestions
      </Text>

      <TextInput
        value={aiPrompt}
        onChangeText={setAiPrompt}
        multiline
        textAlignVertical="top"
        placeholder="Ask AI for advice (this WILL be sent to AI)"
        placeholderTextColor={colors.subtext}
        style={[
          styles.textarea,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
      />

      <Pressable
        onPress={generateAi}
        style={[styles.secondaryBtn, { borderColor: colors.border }]}
      >
        <Text style={[styles.secondaryBtnTxt, { color: colors.text }]}>
          Get AI Suggestions
        </Text>
      </Pressable>

      <View
        style={[
          styles.aiBox,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={{ color: colors.text }}>
          {loadingAi
            ? "Generating AI response…"
            : aiResponse ?? "AI suggestions will appear here."}
        </Text>
      </View>

      <View style={{ height: 16 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 20, paddingTop: 18 },
  title: { fontSize: 28, fontWeight: "900", marginBottom: 16 },
  sectionTitle: { marginTop: 22, fontSize: 18, fontWeight: "900" },
  input: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    fontWeight: "700",
  },
  textarea: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    minHeight: 160,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryBtn: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnTxt: { color: "#fff", fontSize: 16, fontWeight: "900" },
  secondaryBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryBtnTxt: { fontSize: 16, fontWeight: "900" },
  aiBox: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    minHeight: 120,
    justifyContent: "center",
  },
});
